import { isSingleFile } from './is-single-file';

export const isFileArray = (value: unknown): value is Express.Multer.File[] => {
    return Array.isArray(value) && value.every((v) => isSingleFile(v));
};
