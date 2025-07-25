import { IFileReader } from "../../app/services/IFileReader";
import { PDFContent, PDFInfo, PDFPage } from "../../app/value-objects/PDFContent";
import {Poppler as popplerLib} from "node-poppler"
import { FileReadException } from "../../app/exceptions/FileReadException";
import pathLib from "node:path";
import * as fsLib from "node:fs";
import { ImageReader } from "./ImageReader";
import { ImageContent } from "../../app/value-objects/ImageContent";
import { localPath } from "../../app/entities/FileDownloaded";

export type FileSystem = Pick<typeof fsLib, "existsSync" | "mkdirSync" | "readdirSync" | "rmSync">;
export type PopplerUtils = Pick<popplerLib, "pdfToText" | "pdfInfo" | "pdfImages">
export type PathType = Pick<typeof pathLib, "join" | "basename">

/**
 * PDFReader class
 * This class is responsible for reading PDF files and extracting text and images from them.
 * It uses the node-poppler library to interact with PDF files and the ImageReader class to read images.
 * It also uses the fs module to interact with the file system.
 * It is used to read PDF files and extract text and images from them.
 * It is not responsible for downloading or uploading files.
 */
export class PDFReader implements IFileReader<PDFContent>{
    private filePath : string = ""

    constructor(
      private readonly path: PathType = pathLib,
      private readonly fs : FileSystem = fsLib,
      private readonly poppler: PopplerUtils = new popplerLib(),
      private readonly imageReaderClass = ImageReader
    ){
    }
    async read(localPath: localPath): Promise<PDFContent|FileReadException> {
        if (!localPath || !this.fs.existsSync(localPath)) return FileReadException.fileNotFound(localPath)
        this.filePath = localPath
        try{
            return {
                fileName: localPath,
                pages: await this.getPages()
            }
        }catch (e : unknown){
            if(e instanceof FileReadException) return e
            console.error(e);
            return FileReadException.readError(localPath)
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
        const dirName = this.path.join("/tmp", "pdf-reader", randomStringFile)
        this.fs.mkdirSync(dirName, { recursive: true })
        try{
            for(let i = 0; i < pageCount; i++){
                const prefix = this.path.join("/tmp", "pdf-reader", randomStringFile, `page-${i + 1}`)
                const content = await this.poppler.pdfToText(this.filePath, undefined,{
                    firstPageToConvert: i + 1,
                    lastPageToConvert: i + 1,
                })

                await this.poppler.pdfImages(this.filePath, prefix, {
                    allFiles: true,
                    firstPageToConvert: i + 1,
                    lastPageToConvert: i + 1,
                })

                const files = this.fs.readdirSync(dirName)
                const images : Promise<ImageContent|FileReadException>[] = []
                for(const file of files){
                    if(file.startsWith(`page-${i + 1}`)){
                        const imageReader = new this.imageReaderClass()
                        images.push(imageReader.read(this.path.join(dirName, file)))
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
            this.fs.rmSync(dirName, { recursive: true, force: true })
        }
        return pages

    }

}