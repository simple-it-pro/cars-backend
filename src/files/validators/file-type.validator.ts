import { FileValidator } from '@nestjs/common';

import { isSingleFile, isFileArray, isFileRecord } from '../utils';
import { FileInPipelineType } from '../types';

export class FileTypeValidator extends FileValidator<
    { mimeTypes?: (string | RegExp)[]; extensions?: string[] },
    FileInPipelineType
> {
    constructor(options: {
        mimeTypes?: (string | RegExp)[];
        extensions?: string[];
    }) {
        super(options);
    }

    isValid(
        files?:
            | FileInPipelineType
            | FileInPipelineType[]
            | Record<string, FileInPipelineType[]>,
    ) {
        if (!files) return true;

        if (isSingleFile(files)) return this.validateFileType(files);
        if (isFileArray(files)) return this.validateFileTypeArray(files);
        if (isFileRecord(files)) return this.validateFileTypeRecord(files);

        return false;
    }

    buildErrorMessage(
        files:
            | FileInPipelineType
            | FileInPipelineType[]
            | Record<string, FileInPipelineType[]>
            | undefined,
    ): string {
        if (isSingleFile(files))
            return `Некорретный формат файла ${files.originalname}`;

        return `Неверный формат файлов`;
    }

    private validateFileType(file: FileInPipelineType) {
        if (this.validationOptions.extensions) {
            const ext =
                'ext' in file
                    ? file.ext
                    : /^.*\.(?<ext>.*)$/g.exec(file.originalname)?.groups
                          ?.ext || '';
            if (!this.validationOptions.extensions.includes(ext)) return false;
        }

        if (this.validationOptions.mimeTypes) {
            const mime = 'realMime' in file ? file.realMime : file.mimetype;
            let isValid = false;
            for (const mimeType of this.validationOptions.mimeTypes) {
                if (mimeType instanceof RegExp) mimeType.lastIndex = 0;

                if (
                    (mimeType instanceof RegExp && mimeType.test(mime)) ||
                    mimeType === mime
                ) {
                    isValid = true;
                    break;
                }
            }
            return isValid;
        }

        return true;
    }

    private validateFileTypeArray(files: FileInPipelineType[]) {
        for (const file of files) {
            const isValid = this.validateFileType(file);
            if (!isValid) return false;
        }

        return true;
    }

    private validateFileTypeRecord(
        files: Record<string, FileInPipelineType[]>,
    ) {
        for (const key in files) {
            const isValid = this.validateFileTypeArray(files[key]);
            if (!isValid) return false;
        }

        return true;
    }
}
