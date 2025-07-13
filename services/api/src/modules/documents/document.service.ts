import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import {
  DocumentRepositoryProvider,
  IDocumentRepository,
} from '@repositories/document.repository';
import {
  PaginatedResult,
  PaginationOptions,
} from '@repositories/user.repository';
import { UploadedDocument } from '@entities/document.entity';

@Injectable()
export class DocumentService {
  constructor(
    @Inject(DocumentRepositoryProvider.provide)
    private readonly documentRepository: IDocumentRepository,
  ) {}

  public async getUserDocuments(
    connectedUserId: string,
    userId: string,
    pagination: PaginationOptions,
  ): Promise<PaginatedResult<UploadedDocument>> {
    if (connectedUserId !== userId) {
      throw new NotFoundException();
    }
    return this.documentRepository.findByUserId(userId, pagination);
  }
}
