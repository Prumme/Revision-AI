import { Body, Controller, Get, Param, Req } from '@nestjs/common';
import { DocumentService } from './document.service';
import { ReqUser } from '@common/types/request';

@Controller('documents')
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @Get(':identifier')
  async showDocument(@Param('identifier') identifier: string): Promise<any> {
    identifier = 'documents/' + identifier; // Ensure the identifier starts with 'documents/' for s3
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
