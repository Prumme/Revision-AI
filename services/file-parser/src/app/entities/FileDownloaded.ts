export class FileDownloaded{
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly localPath: string,
    public readonly size: number,
    public readonly mime: string,
    public readonly createdAt: Date,
  ) {}

}