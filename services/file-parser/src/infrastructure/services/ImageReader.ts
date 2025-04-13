import { FileReader } from "../../app/services/FileReader";
import { ImageContent } from "../../app/value-objects/ImageContent";
import tesseractLib from "node-tesseract-ocr"
import { FileReadException } from "../../app/exceptions/FileReadException";
import * as fsLib from "node:fs";
import fs from "node:fs";

export type FileSystem = Pick<typeof fs, "existsSync">;
export interface OCR {
    recognize(filePath: string, config: object): Promise<string>;
}

export class ImageReader implements FileReader<ImageContent> {
    private fs: FileSystem;
    private tesseract: OCR;
    constructor(fs: FileSystem = fsLib, tesseract: OCR = tesseractLib) {
        this.fs = fs;
        this.tesseract = tesseract;
    }
    async read(filePath: string): Promise<ImageContent|FileReadException> {
        if (!filePath || !this.fs.existsSync(filePath)) return FileReadException.fileNotFound(filePath)
        const config = {
         lang:"fra",
          oem: 1,
          psm: 3,
        }

        try{
            const content = await this.tesseract.recognize(filePath, config)
            const trimmedContent = content.trim()
            return {
                fileName: filePath,
                content:trimmedContent
            }
        }catch (e : unknown){
            console.error(e);
            return FileReadException.readError(filePath)
        }
    }
}