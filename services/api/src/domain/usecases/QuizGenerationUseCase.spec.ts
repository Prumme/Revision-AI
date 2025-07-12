import {
  CreateQuizUseCaseFactory,
  HandleParsedFileUseCaseFactory,
  HandleQuizGenerationCompletedUseCaseFactory,
} from './QuizGenerationUseCase';
import { QuizRepository } from '@repositories/quiz.repository';
import { UserRepository } from '@repositories/user.repository';
import { QuizGenerationJobRepository } from '@repositories/quiz-generation-job.repository';
import { CachedFileParsedRepository } from '@repositories/cached-file-parsed.repository';
import { QueueProvider } from '@services/QueueProvider';
import * as QuizEntity from '../entities/quiz.entity';
import * as QuizJobEntity from '../entities/quiz-generation-job.entity';
import { mock } from 'jest-mock-extended';
import { FileService } from '@services/FileService';
import { CreateQuizDto } from '@modules/quiz/dto/create-quiz.dto';
import { FileContentDTO } from '../../types/FileContentDTO';
import { QuizGenerationJobStatus } from '../entities/quiz-generation-job.entity';
import { QuizGeneratedDTO } from '../../types/QuizGeneratedDTO';
import { SubscriptionPolicyService } from '../policies/SubscriptionPolicyService';
import { SubscriptionTier } from '../policies/SubscriptionPolicy';

// On utilise jest.Mocked pour que TypeScript connaisse les méthodes de nos mocks
type Mocked<T> = { [P in keyof T]: jest.Mock };

describe('CreateQuizUseCase', () => {
  // Déclaration des mocks pour toutes les dépendances
  let mockQuizRepository: Mocked<QuizRepository>;
  let mockJobRepository: Mocked<QuizGenerationJobRepository>;
  let mockCachedFileRepository: Mocked<CachedFileParsedRepository>;
  let mockFileService: Mocked<FileService>;
  let mockFileToParseQueue: Mocked<QueueProvider<any>>;
  let mockQuizGenerationQueue: Mocked<QueueProvider<any>>;
  let mockPolicy: jest.Mocked<SubscriptionPolicyService>;
  const userTier: SubscriptionTier = 'free';

  beforeEach(() => {
    mockQuizRepository = mock<QuizRepository>();
    mockJobRepository = mock<QuizGenerationJobRepository>();
    mockCachedFileRepository = mock<CachedFileParsedRepository>();
    mockFileService = {
      getFile: jest.fn(),
      getBucketName: jest.fn().mockResolvedValue('bucket-name'),
    };
    mockFileToParseQueue = { send: jest.fn() };
    mockQuizGenerationQueue = { send: jest.fn() };

    mockPolicy = {
      canCreateQuiz: jest.fn().mockReturnValue({ allowed: true }),
      canGenerateToday: jest.fn().mockReturnValue({ allowed: true }),
      canUseFilesForGeneration: jest.fn().mockReturnValue({ allowed: true }),
      canUseTokensForGeneration: jest.fn().mockReturnValue({ allowed: true }),
    } as any;

    jest
      .spyOn(QuizEntity, 'createQuiz')
      .mockImplementation((...args) => ({ id: 'quiz-id-123', ...args }) as any);
    jest
      .spyOn(QuizJobEntity, 'createQuizGenerationJob')
      .mockImplementation((...args) => ({ files: [], ...args }) as any);
    jest
      .spyOn(QuizJobEntity, 'markFileAsParsed')
      .mockImplementation((job) => job);
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(false); // Par défaut, non prêt
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait envoyer les fichiers non-cachés dans la queue de parsing', async () => {
    // --- Arrange (Préparation) ---
    const createQuizDto: CreateQuizDto = {
      title: '',
      userId: '',
      medias: ['file1.pdf', 'file2.txt'],
    };

    mockFileService.getFile
      .mockResolvedValueOnce({ checksum: 'checksum-pdf' } as any)
      .mockResolvedValueOnce({ checksum: 'checksum-txt' } as any);

    // Le repo de cache retourne un fichier pour le PDF (cache hit) mais rien pour le TXT (cache miss)
    mockCachedFileRepository.getParsedFileByChecksum
      .mockResolvedValueOnce({
        identifier: 'file1.pdf',
        checksum: 'checksum-pdf',
      } as any)
      .mockResolvedValueOnce(null);

    mockQuizRepository.create.mockResolvedValue({ id: 'quiz-id-123' } as any);
    mockJobRepository.putJob.mockResolvedValue(true);

    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      jest.fn(),
    );

    // --- Act (Action) ---
    await useCase(createQuizDto);

    // --- Assert (Vérification) ---
    expect(mockFileService.getFile).toHaveBeenCalledTimes(2);
    expect(
      mockCachedFileRepository.getParsedFileByChecksum,
    ).toHaveBeenCalledTimes(2);

    // On vérifie que seul le fichier non-caché (file2.txt) est envoyé pour parsing
    expect(mockFileToParseQueue.send).toHaveBeenCalledTimes(1);
    expect(mockFileToParseQueue.send).toHaveBeenCalledWith(
      expect.objectContaining({
        objectKey: 'file2.txt',
        checksum: 'checksum-txt',
      }),
    );

    // La génération du quiz ne doit PAS être déclenchée
    expect(mockQuizGenerationQueue.send).not.toHaveBeenCalled();
    expect(mockQuizRepository.create).toHaveBeenCalled();
    expect(mockJobRepository.putJob).toHaveBeenCalled();
  });

  it('devrait déclencher la génération du quiz immédiatement si tous les fichiers sont en cache', async () => {
    // --- Arrange (Préparation) ---
    const createQuizDto: CreateQuizDto = {
      title: '',
      userId: '',
      medias: ['file1.pdf'],
    };

    // Tous les fichiers sont trouvés en cache
    mockFileService.getFile.mockResolvedValue({
      checksum: 'checksum-pdf',
    } as any);
    mockCachedFileRepository.getParsedFileByChecksum.mockResolvedValue({
      identifier: 'file1.pdf',
      checksum: 'checksum-pdf',
    } as any);
    mockQuizRepository.create.mockResolvedValue({ id: 'quiz-id-123' } as any);
    mockJobRepository.putJob.mockResolvedValue(true);

    // On s'assure que notre entité confirme que le job est prêt
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);

    // Mock pour generateQuizGenerationDTO qui retourne un objet valide
    const mockGenerateQuizGenerationDTO = jest.fn().mockResolvedValue({
      identifier: 'quiz-id-123',
      questionsNumbers: 10,
      filesContents: [{ fileContent: 'sample content' }]
    });

    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      mockGenerateQuizGenerationDTO,
    );

    // --- Act (Action) ---
    await useCase(createQuizDto);

    // --- Assert (Vérification) ---
    // Aucun fichier ne doit être envoyé au parsing
    expect(mockFileToParseQueue.send).not.toHaveBeenCalled();

    // La génération du quiz DOIT être déclenchée
    expect(mockQuizGenerationQueue.send).toHaveBeenCalledTimes(1);
  });

  it('refuse la création si le quota total de quiz est dépassé', async () => {
    mockPolicy.canCreateQuiz.mockReturnValue({ allowed: false, reason: 'quota total' });
    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      jest.fn(),
    );
    const result = await useCase({ title: '', userId: '', medias: [] });
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('quota total');
    expect(mockPolicy.canCreateQuiz).toHaveBeenCalled();
  });

  it('refuse la création si le quota daily est dépassé', async () => {
    mockPolicy.canGenerateToday.mockReturnValue({ allowed: false, reason: 'quota daily' });
    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      jest.fn(),
    );
    const result = await useCase({ title: '', userId: '', medias: [] });
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('quota daily');
    expect(mockPolicy.canGenerateToday).toHaveBeenCalled();
  });

  it('refuse la création si le quota fichiers est dépassé', async () => {
    mockPolicy.canUseFilesForGeneration.mockReturnValue({ allowed: false, reason: 'quota fichiers' });
    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      jest.fn(),
    );
    const result = await useCase({ title: '', userId: '', medias: ['a', 'b', 'c'] });
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('quota fichiers');
    expect(mockPolicy.canUseFilesForGeneration).toHaveBeenCalled();
  });

  it('refuse la création si le quota tokens est dépassé', async () => {
    mockPolicy.canUseTokensForGeneration.mockReturnValue({ allowed: false, reason: 'quota tokens' });
    // On force le job à être prêt pour déclencher la vérification des tokens
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);
    const fakeQuizGenerationDTO = { filesContents: [{ fileContent: 'abc' }] };
    const fakeGenerateQuizGenerationDTO = jest.fn().mockResolvedValue(fakeQuizGenerationDTO);
    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      fakeGenerateQuizGenerationDTO,
    );
    mockQuizRepository.create.mockResolvedValue({ id: 'quiz-id-123' } as any);
    mockJobRepository.putJob.mockResolvedValue(true);
    const result = await useCase({ title: '', userId: '', medias: ['a'] });
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('quota tokens');
    expect(mockPolicy.canUseTokensForGeneration).toHaveBeenCalled();
  });

  it('autorise la création si tous les quotas sont respectés', async () => {
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);
    const fakeQuizGenerationDTO = { filesContents: [{ fileContent: 'abc' }] };
    const fakeGenerateQuizGenerationDTO = jest.fn().mockResolvedValue(fakeQuizGenerationDTO);
    const useCase = CreateQuizUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockFileService,
      mockFileToParseQueue,
      mockQuizGenerationQueue,
      mockPolicy,
      userTier,
      fakeGenerateQuizGenerationDTO,
    );
    mockQuizRepository.create.mockResolvedValue({ id: 'quiz-id-123' } as any);
    mockJobRepository.putJob.mockResolvedValue(true);
    const result = await useCase({ title: '', userId: '', medias: ['a'] });
    expect(result).not.toBeInstanceOf(Error);
    expect(mockPolicy.canCreateQuiz).toHaveBeenCalled();
    expect(mockPolicy.canGenerateToday).toHaveBeenCalled();
    expect(mockPolicy.canUseFilesForGeneration).toHaveBeenCalled();
    expect(mockPolicy.canUseTokensForGeneration).toHaveBeenCalled();
  });
});

describe('HandleParsedFileUseCase', () => {
  const mockGenerateQuizGenerationDTO = jest.fn();
  // Déclaration des mocks avec jest-mock-extended
  let mockQuizRepository: Mocked<QuizRepository>;
  let mockUserRepository: Mocked<UserRepository>;
  let mockJobRepository: Mocked<QuizGenerationJobRepository>;
  let mockCachedFileRepository: Mocked<CachedFileParsedRepository>;
  let mockQuizGenerationQueue: Mocked<QueueProvider<any>>;
  let mockPolicy: jest.Mocked<SubscriptionPolicyService>;
  const userTier: SubscriptionTier = 'free';

  beforeEach(() => {
    // Initialisation des mocks
    mockQuizRepository = mock<QuizRepository>();
    mockUserRepository = mock<UserRepository>();
    mockJobRepository = mock<QuizGenerationJobRepository>();
    mockCachedFileRepository = mock<CachedFileParsedRepository>();

    mockQuizGenerationQueue = mock<QueueProvider<any>>();

    // Configuration des mocks de base
    mockCachedFileRepository.putFile.mockResolvedValue(true);
    mockJobRepository.putJob.mockResolvedValue(true);
    mockJobRepository.findProcessingJobs.mockResolvedValue([]); // Retourne un tableau vide par défaut

    // On mock les fonctions de l'entité pour contrôler la logique
    jest.spyOn(QuizJobEntity, 'markFileAsParsed').mockImplementation((job) => ({
      ...job,
      files: [{ identifier: 'file-key-123', parsed: true }],
    }));
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(false); // Comportement par défaut

    mockPolicy = {
      canCreateQuiz: jest.fn(),
      canGenerateToday: jest.fn(),
      canUseFilesForGeneration: jest.fn(),
      canUseTokensForGeneration: jest.fn().mockReturnValue({ allowed: true }),
    } as any;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait sauvegarder le fichier parsé et mettre à jour le job sans déclencher la génération', async () => {
    // --- Arrange (Préparation) ---
    const fileContent: FileContentDTO = {
      fileName: 'file1.txt',
      objectKey: 'file-key-123',
      checksum: 'checksum123' /* ... */,
    };
    const fakeJob = {
      id: 'job-1',
      quizId: 'quiz-1',
      files: [{ identifier: 'file-key-123', parsed: false }],
    };

    mockCachedFileRepository.putFile.mockResolvedValue(true);
    mockJobRepository.findProcessingJobs.mockResolvedValue([fakeJob as any]);

    const useCase = HandleParsedFileUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockQuizGenerationQueue,
      mockPolicy,
      mockUserRepository,
      mockGenerateQuizGenerationDTO,
    );

    // --- Act (Action) ---
    await useCase(fileContent);

    // --- Assert (Vérification) ---
    expect(mockCachedFileRepository.putFile).toHaveBeenCalledTimes(1);
    expect(mockJobRepository.findProcessingJobs).toHaveBeenCalledWith({
      files: ['file-key-123'],
    });
    expect(mockJobRepository.putJob).toHaveBeenCalledTimes(1);

    // Le point crucial : la queue de génération ne doit PAS être appelée
    expect(mockQuizGenerationQueue.send).not.toHaveBeenCalled();
    expect(mockGenerateQuizGenerationDTO).not.toHaveBeenCalled();
  });

  it('devrait déclencher la génération du quiz si le fichier parsé complète le job', async () => {
    // --- Arrange (Préparation) ---
    const fileContent: FileContentDTO = {
      fileName: 'file1.txt',
      objectKey: 'file-key-123',
      checksum: 'checksum123' /* ... */,
    };
    const fakeJob = {
      id: 'job-1',
      quizId: 'quiz-1',
      files: [{ identifier: 'file-key-123', parsed: false }],
    };
    const fakeQuiz = { id: 'quiz-1', questionsNumbers: 10 };
    const fakeGeneratedDto = { identifier: 'quiz-1', filesContents: [] };

    mockCachedFileRepository.putFile.mockResolvedValue(true);
    mockJobRepository.findProcessingJobs.mockResolvedValue([fakeJob as any]);

    // On configure le mock pour ce test : le job est maintenant prêt !
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);

    mockQuizRepository.findById.mockResolvedValue(fakeQuiz as any);
    mockUserRepository.findById.mockResolvedValue({ id: 'user-1', subscriptionTier: 'free' } as any);
    mockGenerateQuizGenerationDTO.mockResolvedValue(fakeGeneratedDto);

    const useCase = HandleParsedFileUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockQuizGenerationQueue,
      mockPolicy,
      mockUserRepository,
      mockGenerateQuizGenerationDTO,
    );

    // --- Act (Action) ---
    await useCase(fileContent);

    // --- Assert (Vérification) ---
    expect(mockJobRepository.putJob).toHaveBeenCalledTimes(1);

    // Le point crucial : la queue de génération DOIT être appelée
    expect(mockQuizRepository.findById).toHaveBeenCalledWith('quiz-1');
    expect(mockGenerateQuizGenerationDTO).toHaveBeenCalledTimes(1);
    expect(mockQuizGenerationQueue.send).toHaveBeenCalledTimes(1);
    expect(mockQuizGenerationQueue.send).toHaveBeenCalledWith(fakeGeneratedDto);
  });

  it('refuse la génération si le quota tokens est dépassé', async () => {
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);
    mockPolicy.canUseTokensForGeneration.mockReturnValue({ allowed: false, reason: 'quota tokens' });
    
    const fakeJob = { id: 'job-1', quizId: 'quiz-1', files: [{ identifier: 'file-key-123', parsed: false }] };
    const fakeQuiz = { id: 'quiz-1', questionsNumbers: 10, userId: 'user-1' };
    const fakeUser = { id: 'user-1', subscriptionTier: 'free' };
    const fakeGeneratedDto = { identifier: 'quiz-1', filesContents: [{ fileContent: 'abc' }] };
    
    mockJobRepository.findProcessingJobs.mockResolvedValue([fakeJob as any]);
    mockQuizRepository.findById.mockResolvedValue(fakeQuiz as any);
    mockUserRepository.findById.mockResolvedValue(fakeUser as any);
    mockGenerateQuizGenerationDTO.mockResolvedValue(fakeGeneratedDto);
    const useCase = HandleParsedFileUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockQuizGenerationQueue,
      mockPolicy,
      mockUserRepository,
      mockGenerateQuizGenerationDTO,
    );
    const fileContent: FileContentDTO = {
      fileName: 'file1.txt',
      objectKey: 'file-key-123',
      checksum: 'checksum123',
    };
    const result = await useCase(fileContent);
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toContain('quota tokens');
    expect(mockPolicy.canUseTokensForGeneration).toHaveBeenCalled();
    expect(mockQuizGenerationQueue.send).not.toHaveBeenCalled();
  });

  it('autorise la génération si le quota tokens est respecté', async () => {
    jest.spyOn(QuizJobEntity, 'isReadyForGeneration').mockReturnValue(true);
    mockPolicy.canUseTokensForGeneration.mockReturnValue({ allowed: true });
    
    const fakeJob = { id: 'job-1', quizId: 'quiz-1', files: [{ identifier: 'file-key-123', parsed: false }] };
    const fakeQuiz = { id: 'quiz-1', questionsNumbers: 10, userId: 'user-1' };
    const fakeUser = { id: 'user-1', subscriptionTier: 'free' };
    const fakeGeneratedDto = { identifier: 'quiz-1', filesContents: [{ fileContent: 'abc' }] };
    
    mockJobRepository.findProcessingJobs.mockResolvedValue([fakeJob as any]);
    mockQuizRepository.findById.mockResolvedValue(fakeQuiz as any);
    mockUserRepository.findById.mockResolvedValue(fakeUser as any);
    mockGenerateQuizGenerationDTO.mockResolvedValue(fakeGeneratedDto);
    const useCase = HandleParsedFileUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
      mockCachedFileRepository,
      mockQuizGenerationQueue,
      mockPolicy,
      mockUserRepository,
      mockGenerateQuizGenerationDTO,
    );
    const fileContent: FileContentDTO = {
      fileName: 'file1.txt',
      objectKey: 'file-key-123',
      checksum: 'checksum123',
    };
    const result = await useCase(fileContent);
    expect(result).toBeUndefined();
    expect(mockPolicy.canUseTokensForGeneration).toHaveBeenCalled();
    expect(mockQuizGenerationQueue.send).toHaveBeenCalled();
  });
});

describe('HandleQuizGenerationCompletedUseCase', () => {
  let mockQuizRepository: Mocked<QuizRepository>;
  let mockJobRepository: Mocked<QuizGenerationJobRepository>;

  beforeEach(() => {
    mockQuizRepository = mock<QuizRepository>();
    mockJobRepository = mock<QuizGenerationJobRepository>();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('devrait mettre à jour le quiz et compléter le job en cas de succès', async () => {
    // --- Arrange (Préparation) ---
    const quizGeneratedDTO: QuizGeneratedDTO = {
      identifier: 'quiz-123',
      success: true,
      questions: [{ q: 'Question 1?', answers: [] }],
      t: 'Titre',
    };
    const fakeQuiz = { id: 'quiz-123', questions: [] };
    const fakeJob = { id: 'job-123', quizId: 'quiz-123', events: [] };

    mockQuizRepository.findById.mockResolvedValue(fakeQuiz as any);
    mockJobRepository.findByQuizId.mockResolvedValue(fakeJob as any);

    const useCase = HandleQuizGenerationCompletedUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
    );

    // --- Act (Action) ---
    await useCase(quizGeneratedDTO);

    // --- Assert (Vérification) ---
    expect(mockQuizRepository.findById).toHaveBeenCalledWith('quiz-123');
    expect(mockJobRepository.findByQuizId).toHaveBeenCalledWith('quiz-123');

    // On vérifie que le quiz est bien mis à jour avec les nouvelles questions
    expect(mockQuizRepository.update).toHaveBeenCalledTimes(1);
    expect(mockQuizRepository.update).toHaveBeenCalledWith(
      'quiz-123',
      expect.objectContaining({
        questions: quizGeneratedDTO.questions,
      }),
    );

    // On vérifie que le job est bien marqué comme complété
    expect(mockJobRepository.putJob).toHaveBeenCalledTimes(1);
    expect(mockJobRepository.putJob).toHaveBeenCalledWith(
      expect.objectContaining({ status: QuizGenerationJobStatus.COMPLETED }),
      'job-123',
    );
  });

  it("devrait marquer le job comme FAILED en cas d'échec de la génération", async () => {
    // --- Arrange (Préparation) ---
    const quizGeneratedDTO: QuizGeneratedDTO = {
      identifier: 'quiz-123',
      success: false,
      error: 'API limit reached',
    };
    const fakeQuiz = { id: 'quiz-123' };
    const fakeJob = { id: 'job-123', quizId: 'quiz-123', events: [] };

    mockQuizRepository.findById.mockResolvedValue(fakeQuiz as any);
    mockJobRepository.findByQuizId.mockResolvedValue(fakeJob as any);

    const useCase = HandleQuizGenerationCompletedUseCaseFactory(
      mockQuizRepository,
      mockJobRepository,
    );

    // --- Act (Action) ---
    const result = await useCase(quizGeneratedDTO);

    // --- Assert (Vérification) ---
    // Le quiz ne doit PAS être mis à jour
    expect(mockQuizRepository.update).not.toHaveBeenCalled();

    // Le job doit être mis à jour avec le statut FAILED
    expect(mockJobRepository.putJob).toHaveBeenCalledTimes(1);
    expect(mockJobRepository.putJob).toHaveBeenCalledWith(
      expect.objectContaining({ status: QuizGenerationJobStatus.FAILED }),
      'job-123',
    );

    // Le use case doit retourner une erreur
    expect(result).toBeInstanceOf(Error);
    expect((result as Error).message).toBe('API limit reached');
  });
});
