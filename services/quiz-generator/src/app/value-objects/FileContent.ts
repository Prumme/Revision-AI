export interface FileContent{
  fileName: string;
  content?: string;
  pages?: PageContent[];
}

export interface PageContent {
  number: number;
  content: string;
  images: ImageContent[];
}

export interface ImageContent extends FileContent{
  content: string;
}