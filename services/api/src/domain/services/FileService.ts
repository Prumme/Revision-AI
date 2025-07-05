export interface FileService {
  getBucketName(): string;
  getFile(objectKey: string): Promise<any>;
}
