import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { IFileReader } from "../../app/services/IFileReader";
import { FileReaderStrategies, IFileReaderResolver } from "../../app/services/IFileReaderResolver";
import { FileContent } from "../../app/value-objects/FileContent";
import { ResolveFileReaderException } from "../../app/exceptions/ResolveFileReaderException";
import { PDFReader } from "./PDFReader";
import { ImageReader } from "./ImageReader";


export const DEFAULT_FILE_STRATEGIES : FileReaderStrategies = {
  "application/pdf" : new PDFReader(),
  "image/png" : new ImageReader(),
  "image/jpg": new ImageReader(),
  "image/webp" : new ImageReader(),
}

export class FileReaderResolver implements IFileReaderResolver {
    constructor(private readonly strategies : FileReaderStrategies = DEFAULT_FILE_STRATEGIES) {}

    async resolve(file: FileDownloaded): Promise<IFileReader<FileContent>|ResolveFileReaderException> {
      if(!(file.mime in this.strategies)) return new ResolveFileReaderException(file)
      return this.strategies[file.mime]
    }

}