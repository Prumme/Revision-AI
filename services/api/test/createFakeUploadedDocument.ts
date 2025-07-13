import { UploadedDocument } from '@entities/document.entity';

export function createFakeUploadedDocument(
  name: string,
  identifier: string = 'documents/1234567890abcdef12345678/' + name,
  checksum: string = 'abc123def456ghi789jkl012mno345pqr678stu901vwx234yz567890',
): UploadedDocument {
  return {
    identifier,
    checksum,
    name,
    size: 1024,
    mimeType: 'application/pdf',
    createdAt: new Date(),
  };
}
