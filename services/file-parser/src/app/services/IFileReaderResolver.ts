import { FileDownloaded } from "../entities/FileDownloaded";
import { IFileReader } from "./IFileReader";
import { FileContent } from "../value-objects/FileContent";
import { ResolveFileReaderException } from "../exceptions/ResolveFileReaderException";

export type FileReaderStrategies = Record<string, IFileReader<FileContent>>
export interface IFileReaderResolver {
  resolve(file : FileDownloaded) : Promise<IFileReader<FileContent>|ResolveFileReaderException>
}