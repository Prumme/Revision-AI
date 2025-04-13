import { PDFReader } from "./infrastructure/services/PDFReader";
import * as fs from "node:fs";

async function main(){
    const pdfReader = new PDFReader()
     pdfReader.read("test.pdf").then(result=>{
        if(result instanceof Error){
            console.error(result)
            return
        }
        fs.writeFileSync("result.json", JSON.stringify(result, null, 2))
     })
}

main()