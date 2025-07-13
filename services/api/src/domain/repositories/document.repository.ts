import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';

export interface IDocumentRepository {
  findByQuizId(
    quizId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Document>>;
  findByUserId(
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<Document>>;
}
