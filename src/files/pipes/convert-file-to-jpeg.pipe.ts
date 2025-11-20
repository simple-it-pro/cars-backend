import { Injectable, PipeTransform } from '@nestjs/common';

import {
    bufferConvertToJpeg,
    isSingleFile,
    isFileArray,
    isFileRecord,
} from '../utils';
import { FileInPipelineType } from '../types';
import {
    CONVERTALBE_IMAGE_EXTENSIONS,
    CONVERTALBE_IMAGE_MIME_TYPES,
} from '../conts';

@Injectable()
export class ConvertFileToJpegPipe implements PipeTransform {
    private readonly mimeTypesToConvert?: (string | RegExp)[];
    private readonly extensionsToConvert?: string[];

    constructor({
        mimeTypesToConvert,
        extensionsToConvert,
    }: {
        mimeTypesToConvert?: (string | RegExp)[];
        extensionsToConvert?: string[];
    } = {}) {
        this.mimeTypesToConvert = mimeTypesToConvert;
        this.extensionsToConvert = extensionsToConvert;
    }

    async transform(
        files?:
            | FileInPipelineType
            | FileInPipelineType[]
            | Record<string, FileInPipelineType[]>,
    ) {
        if (!files) return files;

        if (isSingleFile(files)) await this.convertFileToJpeg(files);

        if (isFileArray(files)) {
            for (const file of files) {
                await this.convertFileToJpeg(file);
            }
        }

        if (isFileRecord(files)) {
            for (const key in files) {
                for (const file of files[key]) {
                    await this.convertFileToJpeg(file);
                }
            }
        }

        return files;
    }

    private async convertFileToJpeg(file: FileInPipelineType) {
        const mime = 'realMime' in file ? file.realMime : file.mimetype;
        const ext =
            'ext' in file ? file.ext : file.originalname.split('.').pop();

        const shouldConvert = this.shouldConvertFile(mime, ext);
        if (!shouldConvert) return file;

        const buffer = await bufferConvertToJpeg(mime, file.buffer);

        file.buffer = buffer;
        file.mimetype = 'image/jpeg';
        if ('ext' in file) file.ext = 'jpeg';
        if ('realMime' in file) file.realMime = 'image/jpeg';
        file.originalname = file.originalname.replace(/\.[^.]+$/, '.jpeg');

        return file;
    }

    private shouldConvertFile(mime: string, extension?: string) {
        if (this.mimeTypesToConvert) {
            if (!CONVERTALBE_IMAGE_MIME_TYPES.includes(mime)) return false;

            let shouldConvert = false;

            for (const mimeType of this.mimeTypesToConvert) {
                if (mimeType instanceof RegExp) mimeType.lastIndex = 0;

                const shouldConvertMimeCheck =
                    (mimeType instanceof RegExp && mimeType.test(mime)) ||
                    mimeType === mime;
                if (shouldConvertMimeCheck) {
                    shouldConvert = true;
                    break;
                }
            }

            return shouldConvert;
        }

        if (this.extensionsToConvert) {
            if (!extension || !CONVERTALBE_IMAGE_EXTENSIONS.includes(extension))
                return false;

            return this.extensionsToConvert.includes(extension);
        }

        return false;
    }
}
