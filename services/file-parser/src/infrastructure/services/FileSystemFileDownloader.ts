import { FileDownloader } from "../../app/services/FileDownloader";
import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { FileDownloadException } from "../../app/exceptions/FileDownloadException";

export type FileSystemFileDownloaderArgs = {
  path: string;
}
export class FileSystemFileDownloader implements FileDownloader<FileSystemFileDownloaderArgs> {
  async download(args: FileSystemFileDownloaderArgs): Promise<FileDownloaded|FileDownloadException> {
    const { path } = args;
    const fileName = path.split('/').pop() || 'unknown';
    if(!fileName) return new FileDownloadException('File name is empty');
    const fileSize = 1024; // Placeholder for actual file size
    const fileType = 'text/plain'; // Placeholder for actual file type

    return new FileDownloaded(
      '1', // Placeholder for actual ID
      fileName,
      path,
      fileSize,
      fileType,
      new Date(),
    );
  }
}