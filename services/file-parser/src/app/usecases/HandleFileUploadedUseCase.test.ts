import { handleFileUploadedUseCaseFactory } from "./HandleFileUploadedUseCase";
import { IFileDownloader } from "../services/IFileDownloader";
import { IFileReader } from "../services/IFileReader";
import { FileDownloadException } from "../exceptions/FileDownloadException";
import { FileReadException } from "../exceptions/FileReadException";
import { Failure, Success } from "../../shared/Result";
import { FileContent } from "../value-objects/FileContent";
import { IFileReaderResolver } from "../services/IFileReaderResolver";
import { FileDownloaded } from "../entities/FileDownloaded";
import { ResolveFileReaderException } from "../exceptions/ResolveFileReaderException";

describe("HandleFileUploadedUseCase", () => {
  let mockDownloader: IFileDownloader<string>;
  let mockFileReader: IFileReader<any>;
  let mockFileReaderResolver : IFileReaderResolver

  beforeEach(() => {
    mockDownloader = {
      download: jest.fn(),
    };
    mockFileReader = {
      read: jest.fn(),
    };
    mockFileReaderResolver = {
      resolve: jest.fn()
    }
  });

  it("should return success when file is downloaded and read successfully", async () => {
    const mockInput = "valid-input";
    const mockFilePath = "/path/to/file";
    const mockFileContent = { content: "file content" };

    (mockDownloader.download as jest.Mock).mockResolvedValue({ localPath: mockFilePath });
    (mockFileReader.read as jest.Mock).mockResolvedValue(mockFileContent);
    (mockFileReaderResolver.resolve as jest.Mock).mockResolvedValue(mockFileReader)

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReaderResolver);
    const result = await useCase(mockInput) as Success<FileContent>;

    expect(result.success).toBe(true);
    expect(result.value).toEqual(mockFileContent);
    expect(mockDownloader.download).toHaveBeenCalledWith(mockInput);
    expect(mockFileReader.read).toHaveBeenCalledWith(mockFilePath);
  });

  it("should return failure when file download fails", async () => {
    const mockInput = "invalid-input";
    const mockException = new FileDownloadException("Download failed");

    (mockDownloader.download as jest.Mock).mockResolvedValue(mockException);

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReaderResolver);
    const result = await useCase(mockInput) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toEqual(mockException);
    expect(mockDownloader.download).toHaveBeenCalledWith(mockInput);
    expect(mockFileReader.read).not.toHaveBeenCalled();
  });

  it("should return failure when file reading fails", async () => {
    const mockInput = "valid-input";
    const mockFilePath = "/path/to/file";
    const mockException = new FileReadException("Read failed");

    (mockDownloader.download as jest.Mock).mockResolvedValue({ localPath: mockFilePath });
    (mockFileReader.read as jest.Mock).mockResolvedValue(mockException);
    (mockFileReaderResolver.resolve as jest.Mock).mockResolvedValue(mockFileReader)

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReaderResolver);
    const result = await useCase(mockInput) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toEqual(mockException);
    expect(mockDownloader.download).toHaveBeenCalledWith(mockInput);
    expect(mockFileReader.read).toHaveBeenCalledWith(mockFilePath);
  });

  it('should return failure wile reader resolver fails', async () => {
    const mockInput = "valid-input";
    const mockFilePath = "/path/to/file";
    const mockedFileDownloaded = new FileDownloaded("fake","afke","fake",0,"fake",new Date());
    const mockException = new ResolveFileReaderException(mockedFileDownloaded);

    (mockDownloader.download as jest.Mock).mockResolvedValue({ localPath: mockFilePath });
    (mockFileReaderResolver.resolve as jest.Mock).mockResolvedValue(mockException);

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReaderResolver);
    const result = await useCase(mockInput) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toEqual(mockException);
    expect(mockDownloader.download).toHaveBeenCalledWith(mockInput);
    expect(mockFileReader.read).not.toHaveBeenCalled();
  })
});
