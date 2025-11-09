import { isSingleFile } from './is-single-file';

export const isFileRecord = (
    value: unknown,
): value is Record<string, Express.Multer.File[]> => {
    return (
        typeof value === 'object' &&
        value !== null &&
        !Array.isArray(value) &&
        Object.values(value).every(
            (v) => Array.isArray(v) && v.every((f) => isSingleFile(f)),
        )
    );
};
