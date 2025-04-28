import { FileDownloaded } from "../../app/entities/FileDownloaded";
import { FileDownloadException } from "../../app/exceptions/FileDownloadException";
import { S3FileDownloader, S3FileDownloaderArgs } from "./S3FileDownloader";
describe('S3FileDownloader', () => {
  const fakeS3 = {
    getObject: jest.fn(),
  }

  const fakeMime = {
    getType: jest.fn(),
  }

  const fakeFs = {
    createWriteStream: jest.fn(),
    statSync: jest.fn(),
  }

  let s3FileDownloader: S3FileDownloader;

  beforeEach(()=>{
    s3FileDownloader = new S3FileDownloader(
      fakeS3,
      fakeMime,
      fakeFs
    );
  })

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should download the file and return a valid file downloaded', async () => {
    // Configuration du mock
    const downloadArgs: S3FileDownloaderArgs = {
      bucketName: 'mon-bucket',
      objectKey: 'chemin/vers/fichier.txt',
      downloadPath: './fichier.txt',
    };

    // Mock des méthodes S3, MIME et FS
    const fileStream = { pipe: jest.fn() };
    fakeS3.getObject.mockReturnValueOnce({ createReadStream: () => fileStream });
    fakeMime.getType.mockReturnValue('text/plain');
    fakeFs.createWriteStream.mockReturnValueOnce({
      on: (event : string,callback : ()=> void) => {
        if (event === 'finish') callback();
      }
    });
    fakeFs.statSync.mockReturnValue({ size: 1024 });

    const result = await s3FileDownloader.download(downloadArgs);

    // Vérifications
    expect(result).toBeInstanceOf(FileDownloaded);
    expect(result).toHaveProperty('name', 'fichier.txt');
    expect(result).toHaveProperty('size', 1024);
    expect(result).toHaveProperty('mime', 'text/plain');
  });

  it('should return error if parameters is missings', async () => {
    const downloadArgs: S3FileDownloaderArgs = {
      bucketName: '',
      objectKey: 'chemin/vers/fichier.txt',
      downloadPath: './fichier.txt',
    };

    const result = await s3FileDownloader.download(downloadArgs) as FileDownloadException;

    // Vérifications
    expect(result).toBeInstanceOf(FileDownloadException);
    expect(result.message).toBe("Missing required parameters: bucketName, objectKey, or downloadPath");
  });

  it('should return error if no mime found', async () => {
    const downloadArgs: S3FileDownloaderArgs = {
      bucketName: 'mon-bucket',
      objectKey: 'chemin/vers/fichier.txt',
      downloadPath: './fichier.txt',
    };

    // Mock des méthodes S3 et FS
    const fileStream = { pipe: jest.fn() };
    fakeS3.getObject.mockReturnValueOnce({ createReadStream: () => fileStream });
    fakeMime.getType.mockReturnValueOnce(null);
    fakeFs.createWriteStream.mockReturnValueOnce({
      on: (event : string,callback : ()=> void) => {
        if (event === 'finish') callback();
      }
    });
    fakeFs.statSync.mockReturnValue({ size: 1024 });

    const result = await s3FileDownloader.download(downloadArgs) as FileDownloadException;
    // Vérifications
    expect(result).toBeInstanceOf(FileDownloadException);
    expect(result.message).toBe("Cannot resolve the mime type of the downloaded file");
  });

  it('should return error if S3 download failed', async () => {
    const downloadArgs: S3FileDownloaderArgs = {
      bucketName: 'mon-bucket',
      objectKey: 'chemin/vers/fichier.txt',
      downloadPath: './fichier.txt',
    };

    const error = new Error("Erreur S3");
    fakeS3.getObject.mockImplementationOnce(() => { throw error; });

    const result = await s3FileDownloader.download(downloadArgs) as FileDownloadException;

    // Vérifications
    expect(result).toBeInstanceOf(FileDownloadException);
    expect(result.message).toBe("Error downloading file from S3: Erreur S3");
  });
});
