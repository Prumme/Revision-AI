export interface UploadedDocument {
  identifier: string;
  checksum: string;
  mimeType: string;
  name: string;
  size: number;
  createdAt: Date;
}
