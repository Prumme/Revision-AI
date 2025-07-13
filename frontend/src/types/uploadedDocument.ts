export interface UploadedDocument {
  identifier: string;
  checksum: string;
  mimeType: string;
  name: string;
  size: number;
  createdAt: Date;
  url?: string; // Optional URL for direct access
}
