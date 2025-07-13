import { UploadedDocument } from '@entities/document.entity';

export interface FileService {
  getBucketName(): string;
  getFile(objectKey: string): Promise<any>;

  uploadFile(
    file: Express.Multer.File,
    objectName: string,
  ): Promise<UploadedDocument>;
}
