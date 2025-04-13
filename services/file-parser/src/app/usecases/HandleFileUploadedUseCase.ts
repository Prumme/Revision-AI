import { IUseCase } from "./IUseCase";
import { FileContent } from "../value-objects/FileContent";
import { FileReader } from "../services/FileReader";
import { FileDownloader } from "../services/FileDownloader";
import { FileDownloadException } from "../exceptions/FileDownloadException";
import { FileReadException } from "../exceptions/FileReadException";
import { Result } from "../../shared/Result";

export type HandleFileUploadedUseCase<DL> = IUseCase<DL,Result<FileContent>>
export const handleFileUploadedUseCaseFactory = <DL>(downloader : FileDownloader<DL>, fileReader: FileReader<FileContent>) : HandleFileUploadedUseCase<DL> => {
  return async (input : DL) => {
    const fileDownloaded = await downloader.download(input);
    if(fileDownloaded instanceof FileDownloadException) return Result.Failure(fileDownloaded);
    const fileContent = await fileReader.read(fileDownloaded.localFilePath);
    if(fileContent instanceof FileReadException) return Result.Failure(fileContent);
    return Result.Success(fileContent);
  }
}