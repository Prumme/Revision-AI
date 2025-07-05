import { FileContentDTO } from '../../types/FileContentDTO';

export interface CachedFileParsed {
  checksum: string;
  identifier: string;
  fileContent: FileContentDTO;
  createdAt: Date;
  updatedAt: Date;
}
