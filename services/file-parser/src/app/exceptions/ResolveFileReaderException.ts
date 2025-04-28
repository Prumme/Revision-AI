import { FileDownloaded } from "../entities/FileDownloaded";

export class ResolveFileReaderException extends Error{

  static defaultMessage : string = "Cannot resolve the file reader for this file"
  constructor( file : FileDownloaded, message : string =  ResolveFileReaderException.defaultMessage) {
    super(message + `: ${file.name} and mime ${file.mime}`);
  }
}