export class FileDownloadException extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileDownloadException";
  }
}