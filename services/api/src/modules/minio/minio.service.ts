import { Injectable, OnModuleInit, NotFoundException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as Minio from 'minio';
import { MinioOptions } from './interfaces/minio-options.interface';
import { Readable } from 'stream';

interface MinioFile {
  stream: Readable;
  metadata: { [key: string]: string };
}

@Injectable()
export class MinioService implements OnModuleInit {
  private minioClient: Minio.Client;
  private readonly bucketName: string;

  constructor(private configService: ConfigService) {
    const options: MinioOptions = {
      endPoint: this.configService.get<string>('MINIO_ENDPOINT'),
      port: parseInt(
        this.configService.get<string>('MINIO_PORT') || '9000',
        10,
      ),
      useSSL: this.configService.get<string>('MINIO_USE_SSL') === 'true',
      accessKey: this.configService.get<string>('MINIO_ROOT_USER'),
      secretKey: this.configService.get<string>('MINIO_ROOT_PASSWORD'),
      bucketName: this.configService.get<string>('MINIO_BUCKET_NAME'),
    };

    this.bucketName = options.bucketName;
    this.minioClient = new Minio.Client({
      endPoint: options.endPoint,
      port: options.port,
      useSSL: options.useSSL,
      accessKey: options.accessKey,
      secretKey: options.secretKey,
    });
  }

  async onModuleInit() {
    try {
      const bucketExists = await this.minioClient.bucketExists(this.bucketName);
      if (!bucketExists) {
        await this.minioClient.makeBucket(this.bucketName);
        console.log(`Bucket ${this.bucketName} created successfully`);
      }
    } catch (error) {
      console.error('Error initializing MinIO:', error);
      throw error;
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    objectName: string,
  ): Promise<string> {
    try {
      await this.minioClient.putObject(
        this.bucketName,
        objectName,
        file.buffer,
        file.size,
        {
          'Content-Type': file.mimetype,
        },
      );
      return objectName;
    } catch (error) {
      console.error('Error uploading file to MinIO:', error);
      throw error;
    }
  }

  async getFileUrl(objectName: string): Promise<string> {
    try {
      return await this.minioClient.presignedGetObject(
        this.bucketName,
        objectName,
      );
    } catch (error) {
      console.error('Error getting file URL from MinIO:', error);
      throw error;
    }
  }

  async deleteFile(objectName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, objectName);
    } catch (error) {
      console.error('Error deleting file from MinIO:', error);
      throw error;
    }
  }

  async getFile(objectName: string): Promise<MinioFile> {
    try {
      const exists = await this.minioClient.statObject(
        this.bucketName,
        objectName,
      );
      if (!exists) {
        throw new NotFoundException(`Le fichier ${objectName} n'existe pas`);
      }

      const stream = await this.minioClient.getObject(
        this.bucketName,
        objectName,
      );
      return {
        stream,
        metadata: exists.metaData,
      };
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error getting file from MinIO:', error);
      throw new NotFoundException(
        `Erreur lors de la récupération du fichier ${objectName}`,
      );
    }
  }
}
