export interface FileWithFormat extends Express.Multer.File {
    realMime: string;
    ext: string;
}
