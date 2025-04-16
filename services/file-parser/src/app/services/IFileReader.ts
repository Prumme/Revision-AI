import { FileContent } from "../value-objects/FileContent";
import { FileReadException } from "../exceptions/FileReadException";

export interface IFileReader<T extends FileContent> {
  read(filePath: string): Promise<T|FileReadException>;
}