import { Controller, Get, Param, Res, StreamableFile } from '@nestjs/common';
import { Response } from 'express';
import { MinioService } from './minio.service';
import { ApiTags, ApiOperation, ApiParam } from '@nestjs/swagger';
import { Public } from '@common/decorators/public.decorator';

@ApiTags('MinIO')
@Controller('files')
export class MinioController {
  constructor(private readonly minioService: MinioService) {}

  @Public()
  @Get('avatar/:filename')
  @ApiOperation({ summary: 'Récupérer un avatar' })
  @ApiParam({ name: 'filename', description: 'Nom du fichier avatar' })
  async getAvatar(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    const file = await this.minioService.getFile('avatars/' + filename);

    // Définir les headers appropriés
    res.set({
      'Content-Type': file.metadata['content-type'],
      'Content-Disposition': `inline; filename="${filename}"`,
      'Cache-Control': 'public, max-age=31536000', // Cache pour 1 an
    });

    return new StreamableFile(file.stream);
  }
}
