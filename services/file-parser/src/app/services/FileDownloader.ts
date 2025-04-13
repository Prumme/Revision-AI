import { FileDownloaded } from "../entities/FileDownloaded";
import { FileDownloadException } from "../exceptions/FileDownloadException";

export interface FileDownloader<Args>{
  download(args : Args): Promise<FileDownloaded|FileDownloadException>;
}

