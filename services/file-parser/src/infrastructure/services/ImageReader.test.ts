import { ImageReader } from "./ImageReader";
import { FileReadException } from "../../app/exceptions/FileReadException";

describe("ImageReader", () => {
  const fakeFs = { existsSync: jest.fn() };
  const fakeTesseract = { recognize: jest.fn() };

  it("should return FileReadException.fileNotFound if file doesn't exist", async () => {
    fakeFs.existsSync.mockReturnValue(false);
    const reader = new ImageReader(fakeFs, fakeTesseract);

    const result = await reader.read("missing.png");

    expect(result).toEqual(FileReadException.fileNotFound("missing.png"));
  });

  it("should return ImageContent if OCR works", async () => {
    fakeFs.existsSync.mockReturnValue(true);
    fakeTesseract.recognize.mockResolvedValue("  Bonjour le monde!  ");
    const reader = new ImageReader(fakeFs, fakeTesseract);

    const result = await reader.read("image.png");

    expect(result).toEqual({
      fileName: "image.png",
      content: "Bonjour le monde!"
    });
  });

  it("should return FileReadException.readError if OCR fails", async () => {
    fakeFs.existsSync.mockReturnValue(true);
    fakeTesseract.recognize.mockRejectedValue(new Error("OCR failed"));
    const reader = new ImageReader(fakeFs, fakeTesseract);

    const result = await reader.read("image.png");

    expect(result).toEqual(FileReadException.readError("image.png"));
  });
});
