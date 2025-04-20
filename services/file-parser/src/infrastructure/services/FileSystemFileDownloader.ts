import { IFileDownloader } from "../../app/services/IFileDownloader";
import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { FileDownloadException } from "../../app/exceptions/FileDownloadException";
import mimeLib from "mime";

export type FileSystemFileDownloaderArgs = {
  path: string;
}

export type MimeResolver = Pick<typeof mimeLib,"getType">

/**
 * FileSystemFileDownloader class
 * This class is responsible for "downloading" files from the local file system.
 * It use for testing purposes.
 * It uses the mime library to resolve the mime type of the file.
 * It does not actually download the file, but simulates the download process.
 */
export class FileSystemFileDownloader implements IFileDownloader<FileSystemFileDownloaderArgs> {
  constructor(private readonly mimeResolver : MimeResolver = mimeLib) {
  }
  async download(args: FileSystemFileDownloaderArgs): Promise<FileDownloaded|FileDownloadException> {
    const { path } = args;
    const fileName = path.split('/').pop() || 'unknown';
    if(!fileName) return new FileDownloadException('File name is empty');
    const fileSize = 1024; // Placeholder for actual file size

    const mime = this.mimeResolver.getType(path)
    if(!mime) return new FileDownloadException("Cannot resolve the mime type of the given file")

    return new FileDownloaded(
      '1', // Placeholder for actual ID
      fileName,
      path,
      fileSize,
      mime,
      new Date(),
    );
  }
}