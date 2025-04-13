import { handleFileUploadedUseCaseFactory } from "../../app/usecases/HandleFileUploadedUseCase";
import { FileSystemFileDownloader } from "../services/FileSystemFileDownloader";
import { PDFReader } from "../services/PDFReader";

const fileDownloader = new FileSystemFileDownloader()
const fileReader = new PDFReader()
const handleFileUploadedUseCase = handleFileUploadedUseCaseFactory(fileDownloader,fileReader)

export const cliEntrypoint = async () => {
  const filePath = process.argv[2];
  if(!filePath) {
    console.error("Please provide a file path as an argument.");
    process.exit(1);
  }
  const result = await handleFileUploadedUseCase({
    path: filePath
  })
  if(!result.success) {
    console.error("Error processing file:", result.error.message);
    process.exit(1);
  }

  const fileContent = result.value;
  console.log(fileContent);
  process.exit(0);
}