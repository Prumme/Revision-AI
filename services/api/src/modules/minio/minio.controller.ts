import { Public } from '@common/decorators/public.decorator';
import { CACHE_MANAGER, CacheKey, CacheTTL } from '@nestjs/cache-manager';
import {
  Controller,
  Get,
  Inject,
  Param,
  Res,
  StreamableFile,
} from '@nestjs/common';
import { ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { Cache } from 'cache-manager';
import { Response } from 'express';
import { MinioService } from './minio.service';

@ApiTags('Scaleway S3')
@Controller('files')
export class MinioController {
  constructor(
    private readonly minioService: MinioService,
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) {}

  @Public()
  @Get('avatar/:filename')
  @ApiOperation({ summary: 'Récupérer un avatar depuis Scaleway S3' })
  @ApiParam({ name: 'filename', description: 'Nom du fichier avatar' })
  @CacheKey('avatar')
  @CacheTTL(1800000) // 30 minutes pour les avatars
  async getAvatar(
    @Param('filename') filename: string,
    @Res({ passthrough: true }) res: Response,
  ): Promise<StreamableFile> {
    // Clé de cache pour les métadonnées du fichier
    const metadataCacheKey = `avatar_metadata_${filename}`;

    // Vérifier si les métadonnées sont en cache
    const cachedMetadata = await this.cacheManager.get(metadataCacheKey);

    // Récupérer le fichier depuis S3
    const file = await this.minioService.getFile('avatars/' + filename);

    // Si on a des métadonnées en cache, vérifier l'ETag
    if (cachedMetadata) {
      const metadata = cachedMetadata as {
        etag?: string;
        contentType?: string;
        lastModified?: Date;
      };

      // Définir les headers avec cache HIT
      res.set({
        'Content-Type':
          metadata.contentType ||
          file.contentType ||
          'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache pour 1 an
        'X-Cache': 'HIT', // Indicateur que les métadonnées viennent du cache
        ETag: metadata.etag || `"${filename}"`,
        'Last-Modified': metadata.lastModified?.toUTCString(),
      });
    } else {
      // Mettre en cache les métadonnées pour les prochaines requêtes
      const metadata = {
        etag: `"${filename}-${Date.now()}"`,
        contentType: file.contentType,
        lastModified: new Date(),
      };

      await this.cacheManager.set(metadataCacheKey, metadata, 1800000); // 30 minutes

      // Définir les headers avec cache MISS
      res.set({
        'Content-Type': file.contentType || 'application/octet-stream',
        'Content-Disposition': `inline; filename="${filename}"`,
        'Cache-Control': 'public, max-age=31536000', // Cache pour 1 an
        'X-Cache': 'MISS', // Indicateur que c'est un nouveau fichier
        ETag: metadata.etag,
        'Last-Modified': metadata.lastModified.toUTCString(),
      });
    }

    return new StreamableFile(file.stream);
  }
}
