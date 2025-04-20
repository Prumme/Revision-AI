import { IFileReader } from "../../app/services/IFileReader";
import { ImageContent } from "../../app/value-objects/ImageContent";
import tesseractLib from "node-tesseract-ocr"
import { FileReadException } from "../../app/exceptions/FileReadException";
import * as fsLib from "node:fs";
import fs from "node:fs";
import { localPath } from "../../app/entities/FileDownloaded";

export type FileSystem = Pick<typeof fs, "existsSync">;
export interface OCR {
    recognize(filePath: string, config: object): Promise<string>;
}

export class ImageReader implements IFileReader<ImageContent> {
    private fs: FileSystem;
    private tesseract: OCR;
    constructor(fs: FileSystem = fsLib, tesseract: OCR = tesseractLib) {
        this.fs = fs;
        this.tesseract = tesseract;
    }
    async read(localPath: localPath): Promise<ImageContent|FileReadException> {
        if (!localPath || !this.fs.existsSync(localPath)) return FileReadException.fileNotFound(localPath)
        const config = {
         lang:"fra",
          oem: 1,
          psm: 3,
        }

        try{
            const content = await this.tesseract.recognize(localPath, config)
            const trimmedContent = content.trim()
            return {
                fileName: localPath,
                content:trimmedContent
            }
        }catch (e : unknown){
            console.error(e);
            return FileReadException.readError(localPath)
        }
    }
}