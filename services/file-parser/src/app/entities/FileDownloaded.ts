export class FileDownloaded{
  constructor(
    public readonly id: string,
    public readonly fileName: string,
    public readonly localFilePath: string,
    public readonly fileSize: number,
    public readonly fileType: string,
    public readonly createdAt: Date,
  ) {}

}