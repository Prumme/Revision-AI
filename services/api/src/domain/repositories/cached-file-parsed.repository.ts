import { CachedFileParsed } from '@entities/cached-file-parsed.entity';
import { MongoCachedFileParsedRepository } from '@mongo/quiz/cached-file-parsed.repository';

export interface CachedFileParsedRepository {
  getParsedFileByChecksum(checksum: string): Promise<CachedFileParsed | null>;
  getParsedFileByIdentifier(
    identifier: string,
  ): Promise<CachedFileParsed | null>;
  putFile(file: CachedFileParsed): Promise<boolean>;
}

export const CachedFileParsedRepositoryProvider = {
  provide: 'CachedFileParsedRepository',
  useClass: MongoCachedFileParsedRepository,
};
