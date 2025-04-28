import { FileContent } from "../value-objects/FileContent";
import { FileReadException } from "../exceptions/FileReadException";
import { localPath } from "../entities/FileDownloaded";

export interface IFileReader<T extends FileContent> {
  read(localPath: localPath): Promise<T|FileReadException>;
}