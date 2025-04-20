import { FileDownloaded } from "../entities/FileDownloaded";
import { FileDownloadException } from "../exceptions/FileDownloadException";

/**
 * IFileDownloader interface
 * This interface defines the contract for file downloaders.
 * The downloader are responsible for downloading files from different sources.
 * It needed to process the files locally.
 * It requires an implementation of the download method.
 */
export interface IFileDownloader<Args>{
  download(args : Args): Promise<FileDownloaded|FileDownloadException>;
}

