import { FileReader } from "../../app/services/FileReader";
import { PDFContent, PDFInfo, PDFPage } from "../../app/value-objects/PDFContent";
import {Poppler} from "node-poppler"
import { FileReadException } from "../../app/exceptions/FileReadException";
import path from "node:path";
import * as fs from "node:fs";
import { ImageReader } from "./ImageReader";
import { ImageContent } from "../../app/value-objects/ImageContent";
export class PDFReader implements FileReader<PDFContent>{
    private readonly poppler : Poppler
    private filePath : string

    constructor() {
        this.poppler = new Poppler()
        this.filePath = ""
    }
    async read(filePath: string): Promise<PDFContent|FileReadException> {
        if (!filePath || !fs.existsSync(filePath)) return FileReadException.fileNotFound(filePath)
        this.filePath = filePath
        try{
            return {
                fileName: filePath,
                pages: await this.getPages()
            }
        }catch (e : unknown){
            if(e instanceof FileReadException) return e
            console.error(e);
            return FileReadException.readError(filePath)
        }
    }

    async getPDFInfo(): Promise<PDFInfo> {
        try{
            const pdfInfoRaw = await this.poppler.pdfInfo(this.filePath, {printAsJson: true}) as PDFInfo
            return pdfInfoRaw
        }catch (e : unknown){
            console.error(e);
            throw FileReadException.readError(this.filePath)
        }
    }

    async getPagesCount() : Promise<number> {
        const pdfInfo = await this.getPDFInfo()
        return parseInt(pdfInfo.pages)
    }

    async getPages() : Promise<PDFPage[]> {
        const pageCount = await this.getPagesCount()
        const pages : PDFPage[] = []

        //create a temp dir /tmp
        const randomStringFile = Math.random().toString(36).substring(2, 15)
        const dirName = path.join("/tmp", "pdf-reader", randomStringFile)
        fs.mkdirSync(dirName, { recursive: true })
        try{
            for(let i = 0; i < pageCount; i++){
                const prefix = path.join("/tmp", "pdf-reader", randomStringFile, `page-${i + 1}`)
                const content = await this.poppler.pdfToText(this.filePath, undefined,{
                    firstPageToConvert: i + 1,
                    lastPageToConvert: i + 1,
                })

                await this.poppler.pdfImages(this.filePath, prefix, {
                    allFiles: true,
                    firstPageToConvert: i + 1,
                    lastPageToConvert: i + 1,
                })

                const files = fs.readdirSync(dirName)
                const images : Promise<ImageContent|FileReadException>[] = []
                for(const file of files){
                    if(file.startsWith(`page-${i + 1}`)){
                        const imageReader = new ImageReader()
                        images.push(imageReader.read(path.join(dirName, file)))
                    }
                }

                const imageContents = await Promise.all(images)
                const page : PDFPage = {
                    number: i + 1,
                    content,
                    images: imageContents.filter(image => !(image instanceof FileReadException) && Boolean(image.content)) as ImageContent[]
                }

                pages.push(page)
            }
        } finally {
            fs.rmSync(dirName, { recursive: true, force: true })
        }
        return pages

    }

}