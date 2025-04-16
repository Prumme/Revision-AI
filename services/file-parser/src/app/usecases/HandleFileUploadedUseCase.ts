import { IUseCase } from "./IUseCase";
import { FileContent } from "../value-objects/FileContent";
import { IFileDownloader } from "../services/IFileDownloader";
import { FileDownloadException } from "../exceptions/FileDownloadException";
import { FileReadException } from "../exceptions/FileReadException";
import { Result } from "../../shared/Result";
import { IFileReaderResolver } from "../services/IFileReaderResolver";
import { ResolveFileReaderException } from "../exceptions/ResolveFileReaderException";

export type HandleFileUploadedUseCase<DL> = IUseCase<DL,Result<FileContent>>
export const handleFileUploadedUseCaseFactory = <DL>(downloader : IFileDownloader<DL>, fileReaderResolver: IFileReaderResolver) : HandleFileUploadedUseCase<DL> => {
  return async (input : DL) => {
    const fileDownloaded = await downloader.download(input);
    if(fileDownloaded instanceof FileDownloadException) return Result.Failure(fileDownloaded);
    const fileReader = await fileReaderResolver.resolve(fileDownloaded)
    if(fileReader instanceof ResolveFileReaderException) return Result.Failure(fileReader)
    const fileContent = await fileReader.read(fileDownloaded.localPath);
    if(fileContent instanceof FileReadException) return Result.Failure(fileContent);
    return Result.Success(fileContent);
  }
}