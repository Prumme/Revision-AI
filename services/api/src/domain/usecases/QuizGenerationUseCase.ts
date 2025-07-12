import { UseCase, UseCaseFactory } from './IUseCase';
import { ForbiddenException } from '@nestjs/common';
import { QuizGeneratedDTO } from '../../types/QuizGeneratedDTO';
import { FileContentDTO } from '../../types/FileContentDTO';
import { CreateQuizDto } from '@modules/quiz/dto/create-quiz.dto';
import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import * as QuizJobEntity from '@entities/quiz-generation-job.entity';
import { CachedFileParsedRepository } from '@repositories/cached-file-parsed.repository';
import { QueueProvider } from '@services/QueueProvider';
import { FileToParseDTO } from '../../types/FileToParseDTO';
import * as QuizEntity from '@entities/quiz.entity';
import { QuizRepository } from '@repositories/quiz.repository';
import { CachedFileParsed } from '@entities/cached-file-parsed.entity';
import { QuizGenerationDTO } from '../../types/QuizGenerationDTO';
import { Quiz } from '@entities/quiz.entity';
import { FileService } from '@services/FileService';
import { SubscriptionPolicyService } from '../policies/SubscriptionPolicyService';
import { SubscriptionTier } from '../policies/SubscriptionPolicy';
import { UserRepository } from '@repositories/user.repository';

async function generateQuizGenerationDTO(
  identifier: string,
  questionsNumbers: number,
  filesIdentifiers: string[],
  _cachedFileParsedRepository: CachedFileParsedRepository,
): Promise<QuizGenerationDTO | Error> {
  const files = await Promise.all(
    filesIdentifiers.map((fileIdentifier) =>
      _cachedFileParsedRepository.getParsedFileByIdentifier(fileIdentifier),
    ),
  );

  const parsedFiles = files.filter(Boolean);
  if (parsedFiles.length !== filesIdentifiers.length) {
    return new Error('Not all files have been parsed');
  }

  return {
    identifier,
    questionsNumbers,
    filesContents: parsedFiles.map((file) => file.fileContent),
  };
}

export interface QuizIdentifier {
  quizId: string;
}

/**
 *  --------------------
 *  CREATE QUIZ USE CASE
 *  --------------------
 *
 *  Triggered by the user to create a new quiz
 *  It creates a quiz entity and saves it in the database
 *  It also checks if the files have already been parsed
 *  If not, it sends the files to the file parser service
 *  It creates a quiz generation job and sends it to the queue if all files are parsed
 *  It returns the created pending quiz or an error if something goes wrong
 */

export type CreateQuizUseCase = UseCase<CreateQuizDto, Promise<Quiz | Error | ForbiddenException>>;
export const CreateQuizUseCaseFactory: UseCaseFactory<
  CreateQuizUseCase,
  [
    QuizRepository,
    QuizGenerationJobRepository,
    CachedFileParsedRepository,
    FileService, // @todo abstration is better but to complex with the current implemetentation
    QueueProvider<FileToParseDTO>,
    QueueProvider<QuizGenerationDTO>,
    SubscriptionPolicyService,
    SubscriptionTier,
    typeof generateQuizGenerationDTO?
  ]
> = (
  _quizRepository,
  _quizGenerationJobRepository,
  _cachedFileParsedRepository,
  _fileService,
  _fileToParseQueueProvider,
  _quizGenerationQueueProvider,
  _policyService,
  _userTier,
  _generateQuizGenerationDTO = generateQuizGenerationDTO, // Injected for testing purposes
) => {
  return async (createQuizDto) => {
    // Vérification des quotas
    const [totalQuizzes, quizzesToday] = await Promise.all([
      _quizRepository.countByUserId(createQuizDto.userId),
      _quizRepository.countCreatedToday(createQuizDto.userId)
    ]);
    const filesCount = createQuizDto.medias.length;
    let totalTokens = 0;
    const checkTotal = _policyService.canCreateQuiz(_userTier, totalQuizzes);
    if (!checkTotal.allowed) return new ForbiddenException(checkTotal.reason);
    const checkToday = _policyService.canGenerateToday(_userTier, quizzesToday);
    if (!checkToday.allowed) return new ForbiddenException(checkToday.reason);
    const checkFiles = _policyService.canUseFilesForGeneration(_userTier, filesCount);
    if (!checkFiles.allowed) return new ForbiddenException(checkFiles.reason);

    type FileIdentifierWithChecksum = {
      fileIdentifier: string;
      checksum: string;
    };

    /** Obtenir les checksum des fichiers */
    const checksumsJobs = createQuizDto.medias.map(async (fileIdentifier) => {
      try {
        const file = await _fileService.getFile(fileIdentifier);
        return {
          fileIdentifier,
          checksum: file.checksum,
        };
      } catch (e) {
        console.error('Error fetching file:', e);
        return null;
      }
    });

    const files = (await Promise.all(checksumsJobs)).filter(
      (checksum) => checksum !== null,
    ) as FileIdentifierWithChecksum[];

    /** Verifier que les fichiers non pas déjà été parsés */
    const parsedFiles = (
      await Promise.all(
        files.map(({ checksum }) =>
          _cachedFileParsedRepository.getParsedFileByChecksum(checksum),
        ),
      )
    ).filter(Boolean);
    
    const quiz = QuizEntity.createQuiz(
      createQuizDto.title,
      createQuizDto.description,
      createQuizDto.category,
      createQuizDto.questionsNumbers,
      createQuizDto.isPublic,
      createQuizDto.userId,
      createQuizDto.medias,
    );

    const createdQuiz = await _quizRepository.create(quiz);
    if (!createdQuiz) return new Error('Failed to create quiz');

    let job = QuizJobEntity.createQuizGenerationJob(
      createQuizDto.userId,
      createdQuiz.id,
      createQuizDto.medias,
    );
    job = QuizJobEntity.startParsing(job);
    for (const parsedFile of parsedFiles)
      job = QuizJobEntity.markFileAsParsed(job, parsedFile.identifier);

    if (parsedFiles.length !== files.length) {
      //si il y a des fichiers à parser on les parse
      const alreadyParsedChecksums = parsedFiles.map((file) => file.checksum);
      const filesToParse: FileToParseDTO[] = files
        .filter((file) => !alreadyParsedChecksums.includes(file.checksum))
        .map(({ fileIdentifier, checksum }) => ({
          bucketName: _fileService.getBucketName(),
          objectKey: fileIdentifier,
          fileName: fileIdentifier,
          checksum,
        }));

      for (const file of filesToParse)
        await _fileToParseQueueProvider.send(file);
    }

    const needGenerating = QuizJobEntity.isReadyForGeneration(job);
    if (needGenerating) job = QuizJobEntity.startGenerating(job);

    const inserted = await _quizGenerationJobRepository.putJob(job);
    if (!inserted) return new Error('Failed to create quiz generation job');
      
    if (needGenerating) {
      const quizGenerationDTO = await _generateQuizGenerationDTO(
        createdQuiz.id,
        createdQuiz.questionsNumbers,
        job.files.map((file) => file.identifier),
        _cachedFileParsedRepository,
      );
      if (quizGenerationDTO instanceof Error) return quizGenerationDTO;

      const allParsedFiles = quizGenerationDTO.filesContents
      for (const file of allParsedFiles) {
         let jsonString = JSON.stringify(file);
         totalTokens += jsonString.length;
      }
      const checkTokens = _policyService.canUseTokensForGeneration(
        _userTier,
        totalTokens,
      );
      if (!checkTokens.allowed) {
        return new ForbiddenException(checkTokens.reason);
      }

      await _quizGenerationQueueProvider.send(quizGenerationDTO);
    }

    return createdQuiz;
  };
};

/**
 *  --------------------
 *  HANDLE PARSED FILE USE CASE
 *  --------------------
 *
 *  Trigger when a file has been parsed by the file parser service, receive through a broker
 *  It saves the parsed file in the database to avoid parsing it again later
 *  It updates the quiz generation job status to indicate that the file has been parsed
 *  and sends the quiz generation job to the queue if the job is ready for generation (all dependent files are parsed)
 */

export type HandleParsedFileUseCase = UseCase<
  FileContentDTO,
  Promise<void | Error | ForbiddenException>
>;

export const HandleParsedFileUseCaseFactory: UseCaseFactory<
  HandleParsedFileUseCase,
  [
    QuizRepository,
    QuizGenerationJobRepository,
    CachedFileParsedRepository,
    QueueProvider<QuizGenerationDTO>,
    SubscriptionPolicyService,
    UserRepository,
    typeof generateQuizGenerationDTO?, // Injected for testing purposes
  ]
> = (
  _quizRepository,
  _quizGenerationJobRepository,
  _cachedFileParsedRepository,
  _quizGenerationQueueProvider,
  _policyService,
  _userRepository,
  _generateQuizGenerationDTO = generateQuizGenerationDTO, // Injected for testing purposes
) => {
  return async (fileContent) => {
    let totalTokens = 0;
    // Sauvegarder le fichier parsé dans la base de données pour éviter de le parser à nouveau plus tard
    const cachedFile: CachedFileParsed = {
      fileContent,
      identifier: fileContent.objectKey,
      checksum: fileContent.checksum,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    const inserted = await _cachedFileParsedRepository.putFile(cachedFile);
    if (!inserted) {
      throw new Error('Failed to save parsed file');
    }

    let error = null;

    // Changer l'état du job de génération de quiz en cours pour indiquer que le fichier a été parsé si le job avait ce fichier
    const processingJob = await _quizGenerationJobRepository.findProcessingJobs(
      { files: [fileContent.objectKey] },
    );

    for (let job of processingJob) {
      if (
        job.status === QuizJobEntity.QuizGenerationJobStatus.FAILED ||
        job.status === QuizJobEntity.QuizGenerationJobStatus.COMPLETED
      )
        continue;
      job = QuizJobEntity.markFileAsParsed(job, fileContent.objectKey);
      const needGenerating = QuizJobEntity.isReadyForGeneration(job);
      if (needGenerating) job = QuizJobEntity.startGenerating(job);
      await _quizGenerationJobRepository.putJob(job, job.id);
      if (needGenerating) {
        const quiz = await _quizRepository.findById(job.quizId);
        if (!quiz) {
          error = new Error('Quiz not found for the job');
          console.error(error);
          continue;
        }

        const user = await _userRepository.findById(quiz.userId);
        if (!user) {
          error = new Error('User not found for the quiz');
          console.error(error);
          continue;
        }

        const quizGenerationDTO = await _generateQuizGenerationDTO(
          quiz.id,
          quiz.questionsNumbers,
          job.files.map((file) => file.identifier),
          _cachedFileParsedRepository,
        );

        if (quizGenerationDTO instanceof Error) {
          error = quizGenerationDTO;
          console.error('Error generating quiz generation DTO:', error);
          continue;
        }

        const allParsedFiles = quizGenerationDTO.filesContents
        for (const file of allParsedFiles) {
          let jsonString = JSON.stringify(file);
          totalTokens += jsonString.length;
        }
        const checkTokens = _policyService.canUseTokensForGeneration(
          user.subscriptionTier as SubscriptionTier || "free",
          totalTokens,
        );
        if (!checkTokens.allowed) {
          return new ForbiddenException(checkTokens.reason);
        }

        await _quizGenerationQueueProvider.send(quizGenerationDTO);
      }
    }
    if (error) return error;
    return;
  };
};

/**
 *  --------------------
 *  HANDLE QUIZ GENERATION COMPLETED USE CASE
 *  --------------------
 *
 *  Trigger when a quiz has been generated by the quiz-generator service, receive through a broker
 *  It updates the quiz with the generated questions
 *  It updates the quiz generation job status to indicate that the job is completed
 */

export type HandleQuizGenerationCompletedUseCase = UseCase<
  QuizGeneratedDTO,
  Promise<void | Error>
>;
export const HandleQuizGenerationCompletedUseCaseFactory: UseCaseFactory<
  HandleQuizGenerationCompletedUseCase,
  [QuizRepository, QuizGenerationJobRepository]
> = (_quizRepository, _quizGenerationJobRepository) => {
  return async (quizGeneratedDTO) => {
    const quiz = await _quizRepository.findById(quizGeneratedDTO.identifier);
    if (!quiz) {
      console.error('Quiz Not found', quizGeneratedDTO.identifier);
      return new Error('Quiz not found');
    }

    let job = await _quizGenerationJobRepository.findByQuizId(
      quizGeneratedDTO.identifier,
    );
    if (!job) {
      console.error('Job Not found', quizGeneratedDTO.identifier);
      return new Error('Job not found');
    }

    if (quizGeneratedDTO.success == true) {
      try {
        const quizUpdated = QuizEntity.putQuestions(
          quiz,
          quizGeneratedDTO.questions,
        );
        await _quizRepository.update(quiz.id, quizUpdated);

        job = QuizJobEntity.completeJob(job);
        await _quizGenerationJobRepository.putJob(job, job.id);

        return;
      } catch (e) {
        return e;
      }
    } else if (quizGeneratedDTO.success == false) {
      console.error(
        'Error during the generation of the quiz:',
        quizGeneratedDTO.identifier,
      );
      job = QuizJobEntity.failJob(job, quizGeneratedDTO.error);
      await _quizGenerationJobRepository.putJob(job, job.id);

      return new Error(quizGeneratedDTO.error);
    }
  };
};

/**
 *  --------------------
 *  GET JOB PROGRESS USE CASE
 *  --------------------
 *
 *  Trigger by SSE controller to get the progress of a job by polling the job status
 */
export type GetJobProgressDTO = {
  parsingFileProgress: number;
  status: QuizJobEntity.QuizGenerationJobStatus;
};
export type GetJobProgressUseCase = UseCase<
  QuizIdentifier,
  Promise<GetJobProgressDTO | Error>
>;
export const GetJobProgressUseCaseFactory: UseCaseFactory<
  GetJobProgressUseCase,
  [QuizGenerationJobRepository]
> = (_quizGenerationJobRepository) => {
  return async (quizIdentifier) => {
    const job = await _quizGenerationJobRepository.findByQuizId(
      quizIdentifier.quizId,
    );
    if (!job) {
      return Error('Job not found');
    }
    return {
      parsingFileProgress:
        job.files.filter((file) => file.parsed).length / job.files.length,
      status: job.status,
    };
  };
};
