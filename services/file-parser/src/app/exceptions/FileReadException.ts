export class FileReadException extends Error{
    constructor(message: string) {
        super(message);
        this.name = "FileReadException";
    }

    static fileNotFound(filePath: string): FileReadException {
        return new FileReadException(`File not found: ${filePath}`);
    }

    static invalidFileFormat(filePath: string): FileReadException {
        return new FileReadException(`Invalid file format: ${filePath}`);
    }

    static readError(filePath: string): FileReadException {
        return new FileReadException(`Error reading file: ${filePath}`);
    }
}