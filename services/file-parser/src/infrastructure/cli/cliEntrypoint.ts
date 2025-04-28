import { handleFileUploadedUseCaseFactory } from "../../app/usecases/HandleFileUploadedUseCase";
import { FileSystemFileDownloader } from "../services/FileSystemFileDownloader";
import mimeLib from "mime"
import { FileReaderResolver } from "../services/FileReaderResolver";

const fileDownloader = new FileSystemFileDownloader()
const fileReaderResolver = new FileReaderResolver()
const handleFileUploadedUseCase = handleFileUploadedUseCaseFactory(fileDownloader,fileReaderResolver)

export const cliEntrypoint = async () => {
  const filePath = process.argv[2];

  if(!filePath) {
    console.error("Please provide a file path as an argument.");
    process.exit(1);
  }

  //get file mime type
  const mimeType = mimeLib.getType(filePath)
  if(!mimeType){
    console.error("Cannot determine the mime type of the given file.")
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