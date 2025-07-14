import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';
import { MongoDocumentRepository } from '@mongo/document/document.repository';
import { UploadedDocument } from '@entities/document.entity';

export interface IDocumentRepository {
  findByIdentifier(string: string): Promise<UploadedDocument | null>;
  findByQuizId(
    quizId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UploadedDocument>>;
  findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UploadedDocument>>;
}

export const DocumentRepositoryProvider = {
  provide: 'DocumentRepository',
  useClass: MongoDocumentRepository,
};
