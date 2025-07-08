import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { CachedFileParsedRepository } from '@repositories/cached-file-parsed.repository';
import { CachedFileParsedDocument } from '@mongo/quiz/cached-file-parsed.schema';
import { CachedFileParsed } from '@entities/cached-file-parsed.entity';

@Injectable()
export class MongoCachedFileParsedRepository
  implements CachedFileParsedRepository
{
  constructor(
    @InjectModel('CacheFileParsed')
    private readonly cacheFileParsed: Model<CachedFileParsedDocument>,
  ) {}

  async getParsedFileByChecksum(
    checksum: string,
  ): Promise<CachedFileParsed | null> {
    const document = await this.cacheFileParsed.findOne({ checksum }).exec();
    if (!document) return null;
    return document.toObject() as CachedFileParsed;
  }
  async getParsedFileByIdentifier(
    identifier: string,
  ): Promise<CachedFileParsed | null> {
    const document = await this.cacheFileParsed.findOne({ identifier }).exec();
    if (!document) return null;
    return document.toObject() as CachedFileParsed;
  }
  async putFile(file: CachedFileParsed): Promise<boolean> {
    try {
      const existingFile = await this.cacheFileParsed
        .findOne({ checksum: file.checksum })
        .exec();
      if (existingFile) {
        // If the file already exists, we update it
        await this.cacheFileParsed.updateOne(
          { checksum: file.checksum },
          { $set: file },
        );
      } else {
        await this.cacheFileParsed.create(file);
      }
      return true;
    } catch (error) {
      console.error('Error while saving file to cache:', error);
      return false;
    }
  }
}
