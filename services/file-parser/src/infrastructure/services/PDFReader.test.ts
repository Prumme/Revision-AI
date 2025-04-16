import { PDFReader } from "./PDFReader";
import { FileReadException } from "../../app/exceptions/FileReadException";

const fakeFs = {
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  readdirSync: jest.fn(),
  rmSync: jest.fn()
};

const fakePath = {
  join: jest.fn((...parts) => parts.join("/")),
  basename: jest.fn((p) => p.split("/").pop())
};

const fakePoppler = {
  pdfInfo: jest.fn(),
  pdfToText: jest.fn(),
  pdfImages: jest.fn()
};

const fakeImageReader = {
  read: jest.fn()
};

const FakeImageReaderClass = jest.fn().mockImplementation(() => fakeImageReader);

describe("PDFReader", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return FileReadException.fileNotFound if file doesn't exist", async () => {
    fakeFs.existsSync.mockReturnValue(false);
    const reader = new PDFReader(fakePath, fakeFs, fakePoppler, FakeImageReaderClass);

    const result = await reader.read("somefile.pdf");

    expect(result).toEqual(FileReadException.fileNotFound("somefile.pdf"));
  });

  it("should process PDF with one page and return content", async () => {
    fakeFs.existsSync.mockReturnValue(true);
    fakePoppler.pdfInfo.mockResolvedValue({ pages: "1" });
    fakePoppler.pdfToText.mockResolvedValue("Texte de la page 1");
    fakePoppler.pdfImages.mockResolvedValue(undefined);
    fakeFs.readdirSync.mockReturnValue(["page-1-1.jpg"]);
    fakeImageReader.read.mockResolvedValue({
      fileName: "/tmp/pdf-reader/fake/page-1-1.jpg",
      content: "image content"
    });

    const reader = new PDFReader(fakePath, fakeFs, fakePoppler, FakeImageReaderClass);

    const result = await reader.read("document.pdf");

    expect(result).toEqual({
      fileName: "document.pdf",
      pages: [
        {
          number: 1,
          content: "Texte de la page 1",
          images: [
            {
              fileName: "/tmp/pdf-reader/fake/page-1-1.jpg",
              content: "image content"
            }
          ]
        }
      ]
    });

    expect(fakeFs.rmSync).toHaveBeenCalled(); // vérifie bien le nettoyage
  });
});
