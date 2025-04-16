import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { IFileDownloader } from "../../app/services/IFileDownloader";
import { FileDownloadException } from "../../app/exceptions/FileDownloadException";

export type HTTPFileDownloaderArgs = {
  url: string;
  fileId: string;
}

export class HTTPFileDownloader implements IFileDownloader<HTTPFileDownloaderArgs> {
    download(args: HTTPFileDownloaderArgs): Promise<FileDownloaded|FileDownloadException> {
        throw new Error("Method not implemented.");
      /* @TODO implement the logic to download file from the API Backend or from a S3 storage */
    }

}