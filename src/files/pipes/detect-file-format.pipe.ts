import { BadRequestException, Injectable, PipeTransform } from '@nestjs/common';
import { fileTypeFromBuffer } from 'file-type';

import { isSingleFile, isFileArray, isFileRecord } from '../utils';
import { FileWithFormat } from '../interfaces';

@Injectable()
export class DetectFileFormatPipe implements PipeTransform {
    async transform(
        files?:
            | FileWithFormat
            | FileWithFormat[]
            | Record<string, FileWithFormat[]>,
    ) {
        if (!files) return files;

        if (isSingleFile(files)) {
            const fileType = await this.getFileType(files);
            files.realMime = fileType.mime;
            files.ext = fileType.ext;
        }

        if (isFileArray(files)) {
            for (const file of files) {
                const fileType = await this.getFileType(file);
                file.realMime = fileType.mime;
                file.ext = fileType.ext;
            }
        }

        if (isFileRecord(files)) {
            for (const key in files) {
                for (const file of files[key]) {
                    const fileType = await this.getFileType(file);
                    file.realMime = fileType.mime;
                    file.ext = fileType.ext;
                }
            }
        }

        return files;
    }

    private async getFileType(file: FileWithFormat) {
        const fileType = await fileTypeFromBuffer(file.buffer);

        if (!fileType) return { ext: '', mime: '' };

        return { ext: fileType.ext, mime: fileType.mime };
    }
}
