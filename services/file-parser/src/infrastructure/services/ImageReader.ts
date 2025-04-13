import { FileReader } from "../../app/services/FileReader";
import { ImageContent } from "../../app/value-objects/ImageContent";
import tesseract from "node-tesseract-ocr"
import { FileReadException } from "../../app/exceptions/FileReadException";
import * as fs from "node:fs";
export class ImageReader implements FileReader<ImageContent> {
    async read(filePath: string): Promise<ImageContent|FileReadException> {
        if (!filePath || !fs.existsSync(filePath)) return FileReadException.fileNotFound(filePath)
        const config = {
         lang:"fra",
          oem: 1,
          psm: 3,
        }

        try{
            const content = await tesseract.recognize(filePath, config)
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