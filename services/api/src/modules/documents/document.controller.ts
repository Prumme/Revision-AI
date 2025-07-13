import {
  Body,
  Controller,
  Get,
  Inject,
  NotFoundException,
  Param,
  Query,
  Req,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { DocumentService } from './document.service';
import { ReqUser } from '@common/types/request';
import { SignedRoute } from '@common/decorators/signedRoute.decorator';
import { MinioService } from '@modules/minio/minio.service';
import {
  DocumentRepositoryProvider,
  IDocumentRepository,
} from '@repositories/document.repository';
import { Response } from 'express';

@Controller('documents')
export class DocumentController {
  constructor(
    private readonly documentService: DocumentService,
    @Inject(DocumentRepositoryProvider.provide)
    private readonly documentRepository: IDocumentRepository,
    private readonly minioService: MinioService,
  ) {}

  @Get('view')
  @SignedRoute()
  async showDocument(
    @Query('f') identifier: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<any> {
    const document = await this.documentRepository.findByIdentifier(identifier);
    if (!document) {
      throw new NotFoundException('Document not found');
    }
    const file = await this.minioService.getFile(identifier);
    res.set({
      'Content-Type': file.contentType || 'application/octet-stream',
      'Content-Disposition': `inline; filename="${document.name}"`,
    });
    return new StreamableFile(file.stream);
  }

  @Get('users/:userId')
  async getUserDocuments(
    @Param('userId') userId: string,
    @Req() request: { user: ReqUser },
    @Body() body: { limit: number; page: number } = { limit: 10, page: 1 }, // Default pagination
  ): Promise<any> {
    return this.documentService.getUserDocuments(
      request.user.sub,
      userId,
      body,
    );
  }
}
