import { handleFileUploadedUseCaseFactory } from "./HandleFileUploadedUseCase";
import { FileDownloader } from "../services/FileDownloader";
import { FileReader } from "../services/FileReader";
import { FileDownloadException } from "../exceptions/FileDownloadException";
import { FileReadException } from "../exceptions/FileReadException";
import { Failure, Result, Success } from "../../shared/Result";
import { FileContent } from "../value-objects/FileContent";

describe("HandleFileUploadedUseCase", () => {
  let mockDownloader: FileDownloader<string>;
  let mockFileReader: FileReader<any>;

  beforeEach(() => {
    mockDownloader = {
      download: jest.fn(),
    };
    mockFileReader = {
      read: jest.fn(),
    };
  });

  it("should return success when file is downloaded and read successfully", async () => {
    const mockInput = "valid-input";
    const mockFilePath = "/path/to/file";
    const mockFileContent = { content: "file content" };

    (mockDownloader.download as jest.Mock).mockResolvedValue({ localFilePath: mockFilePath });
    (mockFileReader.read as jest.Mock).mockResolvedValue(mockFileContent);

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReader);
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

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReader);
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

    (mockDownloader.download as jest.Mock).mockResolvedValue({ localFilePath: mockFilePath });
    (mockFileReader.read as jest.Mock).mockResolvedValue(mockException);

    const useCase = handleFileUploadedUseCaseFactory(mockDownloader, mockFileReader);
    const result = await useCase(mockInput) as Failure;

    expect(result.success).toBe(false);
    expect(result.error).toEqual(mockException);
    expect(mockDownloader.download).toHaveBeenCalledWith(mockInput);
    expect(mockFileReader.read).toHaveBeenCalledWith(mockFilePath);
  });
});
