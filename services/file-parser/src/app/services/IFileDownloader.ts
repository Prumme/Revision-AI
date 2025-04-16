import { FileDownloaded } from "../entities/FileDownloaded";
import { FileDownloadException } from "../exceptions/FileDownloadException";

export interface IFileDownloader<Args>{
  download(args : Args): Promise<FileDownloaded|FileDownloadException>;
}

