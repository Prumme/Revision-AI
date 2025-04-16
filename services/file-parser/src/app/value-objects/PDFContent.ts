import { ImageContent } from "./ImageContent";
import { FileContent } from "./FileContent";

export interface PDFContent extends FileContent{
  pages : PDFPage[]
}

export interface PDFInfo {
  title: string;
  author: string;
  creator: string;
  producer: string;
  creationDate: string;
  modDate: string;
  tagged: string;
  userProperties: string;
  suspects: string;
  form: string;
  javaScript: string;
  pages: string;
  encrypted: string;
  pageSize: string;
  pageRot: string;
  fileSize: string;
  optimized: string;
  pdfVersion: string;
}

export interface PDFPage {
  number: number
  content : string,
  images : ImageContent[]
}