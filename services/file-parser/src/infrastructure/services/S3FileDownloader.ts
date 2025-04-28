import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { IFileDownloader } from "../../app/services/IFileDownloader";
import { FileDownloadException } from "../../app/exceptions/FileDownloadException";
import mimeLib from "mime";
import * as AWS from "aws-sdk";
import * as fsLib from "node:fs";

export type MimeResolver = Pick<typeof mimeLib,"getType">

export type S3FileDownloaderArgs = {
  bucketName: string;
  objectKey: string;
  downloadPath: string;
}

type FileSystem = Pick<typeof fsLib, "createWriteStream" | "statSync">
type S3Client = Pick<AWS.S3, "getObject">
/**
 * S3FileDownloader class
 * This class is responsible for downloading files from an S3 bucket.
 * It uses the AWS SDK to interact with S3 and the fs module to write files to disk.
 */
export class S3FileDownloader implements IFileDownloader<S3FileDownloaderArgs> {
  constructor(
    private readonly s3Client: S3Client = new AWS.S3(), // Client S3 injectable
    private readonly mimeResolver: MimeResolver = mimeLib, // Mime resolver injectable
    private readonly fileSystem: FileSystem = fsLib // File system injectable
  ) {}
    async download(args: S3FileDownloaderArgs): Promise<FileDownloaded|FileDownloadException> {
      const { bucketName, objectKey, downloadPath } = args;
      if (!bucketName || !objectKey || !downloadPath) {
        return new FileDownloadException("Missing required parameters: bucketName, objectKey, or downloadPath");
      }

      try{
        const params = {
          Bucket: bucketName,
          Key: objectKey,
        };
        const fileStream = this.s3Client.getObject(params).createReadStream();
        const writeStream = this.fileSystem.createWriteStream(downloadPath);
        fileStream.pipe(writeStream);

        return new Promise<FileDownloaded|FileDownloadException>((resolve)=>{
          writeStream.on('finish', () => {

            const mime = this.mimeResolver.getType(downloadPath);
            if (!mime) return resolve(new FileDownloadException("Cannot resolve the mime type of the downloaded file"));

            const fileName = objectKey.split('/').pop() || 'unknown';
            const fileSize = this.fileSystem.statSync(downloadPath).size;

            resolve(new FileDownloaded(
              '1', // Placeholder for actual ID
              fileName,
              downloadPath,
              fileSize,
              mime,
              new Date(),
            ));
          });

          writeStream.on('error', (error) => {
            resolve(new FileDownloadException(`Error writing file to disk: ${error.message}`));
          });
        })
      }catch (error : unknown) {
        if(error instanceof Error) {
          return new FileDownloadException(`Error downloading file from S3: ${error?.message}`);
        }
        return new FileDownloadException("Unknown error downloading file from S3");
      }
    }
}