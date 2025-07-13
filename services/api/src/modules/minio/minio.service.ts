import {
  Injectable,
  Logger,
  NotFoundException,
  OnModuleInit,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as AWS from 'aws-sdk';
import { Readable } from 'stream';
import { ScalewayS3Options } from './interfaces/minio-options.interface';
import { FileService } from '@services/FileService';
import { UploadedDocument } from '@entities/document.entity';

interface StorageFile {
  stream: Readable;
  metadata: { [key: string]: string };
  contentType?: string;
  checksum: string;
}

@Injectable()
export class MinioService implements OnModuleInit, FileService {
  private s3Client: AWS.S3;
  private readonly bucketName: string;

  constructor(
    private configService: ConfigService,
    private readonly logger: Logger,
  ) {
    // Validation des variables d'environnement requises
    const accessKeyId = this.configService.get<string>(
      'SCALEWAY_ACCESS_KEY_ID',
    );
    const secretAccessKey = this.configService.get<string>(
      'SCALEWAY_ACCESS_KEY',
    );
    const bucketUrl = this.configService.get<string>('SCALEWAY_BUCKET_URL');
    const bucketName = this.configService.get<string>('SCALEWAY_BUCKET_NAME');

    if (!accessKeyId) {
      throw new Error('SCALEWAY_ACCESS_KEY_ID manquant dans le fichier .env');
    }
    if (!secretAccessKey) {
      throw new Error('SCALEWAY_ACCESS_KEY manquant dans le fichier .env');
    }
    if (!bucketUrl) {
      throw new Error('SCALEWAY_BUCKET_URL manquant dans le fichier .env');
    }
    if (!bucketName) {
      throw new Error('SCALEWAY_BUCKET_NAME manquant dans le fichier .env');
    }

    // Configuration pour Scaleway S3
    const options: ScalewayS3Options = {
      accessKeyId,
      secretAccessKey,
      endpoint: bucketUrl,
      region: this.configService.get<string>('SCALEWAY_REGION') || 'fr-par',
      bucketName,
    };

    this.bucketName = options.bucketName;

    console.log(`Configuration Scaleway S3:`);
    console.log(`- Endpoint: ${options.endpoint}`);
    console.log(`- Region: ${options.region}`);
    console.log(`- Bucket: ${options.bucketName}`);
    console.log(`- Access Key ID: ${accessKeyId.substring(0, 8)}...`);

    this.s3Client = new AWS.S3({
      accessKeyId: options.accessKeyId,
      secretAccessKey: options.secretAccessKey,
      endpoint: options.endpoint,
      region: options.region,
      signatureVersion: 'v4',
      s3ForcePathStyle: true,
    });
  }

  getBucketName(): string {
    return this.bucketName;
  }

  async onModuleInit() {
    try {
      // Vérifier que le bucket existe
      await this.s3Client.headBucket({ Bucket: this.bucketName }).promise();
      this.logger.log(
        `Connexion au bucket Scaleway S3 ${this.bucketName} réussie`,
      );
    } catch (error) {
      if (error.statusCode === 404) {
        console.log(
          `Le bucket ${this.bucketName} n'existe pas. Tentative de création...`,
        );
        try {
          await this.s3Client
            .createBucket({
              Bucket: this.bucketName,
              CreateBucketConfiguration: {
                LocationConstraint:
                  this.configService.get<string>('SCALEWAY_REGION') || 'fr-par',
              },
            })
            .promise();
          console.log(
            `Bucket ${this.bucketName} créé avec succès sur Scaleway S3`,
          );
        } catch (createError) {
          console.error('Erreur lors de la création du bucket:', createError);
          throw createError;
        }
      } else {
        console.error("Erreur lors de l'initialisation de Scaleway S3:", error);
        throw error;
      }
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    objectName: string,
  ): Promise<UploadedDocument> {
    try {
      const params: AWS.S3.PutObjectRequest = {
        Bucket: this.bucketName,
        Key: objectName,
        Body: file.buffer,
        ContentType: file.mimetype,
      };

      const result = await this.s3Client.upload(params).promise();
      this.logger.log(`Fichier uploadé avec succès: ${result.Location}`);
      return {
        size: file.size,
        name: file.originalname,
        identifier: objectName,
        mimeType: file.mimetype,
        checksum: result.ETag.replace(/"/g, ''),
      };
    } catch (error) {
      this.logger.error("Erreur lors de l'upload vers Scaleway S3:", error);
      throw error;
    }
  }

  async getFileUrl(objectName: string): Promise<string> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: objectName,
        Expires: 24 * 60 * 60, // URL valide 24h
      };

      return this.s3Client.getSignedUrl('getObject', params);
    } catch (error) {
      this.logger.error(
        "Erreur lors de la génération de l'URL Scaleway S3:",
        error,
      );
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      const params = {
        Bucket: this.bucketName,
        Key: objectName,
      };

      await this.s3Client.deleteObject(params).promise();
    } catch (error) {
      this.logger.error(
        'Erreur lors de la suppression du fichier sur Scaleway S3:',
        error,
      );
      throw error;
    }
  }

  async getFile(objectName: string): Promise<StorageFile> {
    try {
      // Vérifier que l'objet existe
      const headParams = {
        Bucket: this.bucketName,
        Key: objectName,
      };

      const headResult = await this.s3Client.headObject(headParams).promise();

      // Récupérer l'objet
      const getParams = {
        Bucket: this.bucketName,
        Key: objectName,
      };

      const result = await this.s3Client.getObject(getParams).promise();

      if (!result.Body) {
        throw new NotFoundException(
          `Le fichier ${objectName} n'a pas de contenu`,
        );
      }
      this.logger.log(`Fichier ${objectName} récupéré avec succès`);

      // Convertir le Body en Readable stream
      let stream: Readable;
      if (result.Body instanceof Buffer) {
        stream = Readable.from(result.Body);
      } else if (result.Body instanceof Uint8Array) {
        stream = Readable.from(Buffer.from(result.Body));
      } else {
        stream = result.Body as Readable;
      }

      return {
        stream,
        metadata: headResult.Metadata || {},
        contentType: headResult.ContentType,
        checksum:
          headResult?.ChecksumSHA256 || headResult.ETag.replace(/"/g, ''),
      };
    } catch (error) {
      if (error.statusCode === 404) {
        throw new NotFoundException(`Le fichier ${objectName} n'existe pas`);
      }
      this.logger.error(
        'Erreur lors de la récupération du fichier depuis Scaleway S3:',
        error,
      );
      throw new NotFoundException(
        `Erreur lors de la récupération du fichier ${objectName}`,
      );
    }
  }
}
