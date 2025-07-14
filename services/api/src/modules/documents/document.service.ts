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
import { generateSignature } from '@infrastructure/urlSignature';
import * as process from 'node:process';

interface SignedUploadedDocument extends UploadedDocument {
  url: string;
}

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
    const paginatedDocuments = await this.documentRepository.findByUserId(
      userId,
      pagination,
    );

    paginatedDocuments.data = paginatedDocuments.data.map((document) => {
      const pathSigned = generateSignature(
        '/documents/view',
        3600, // 1 hour expiration,
        process.env.JWT_SECRET,
        {
          f: document.identifier,
        },
      );
      return {
        ...document,
        url: pathSigned,
      } as SignedUploadedDocument;
    });

    return paginatedDocuments;
  }
}
