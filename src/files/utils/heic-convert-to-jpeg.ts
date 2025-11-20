import { BadRequestException } from '@nestjs/common';
import * as convert from 'heic-convert';

export const bufferConvertToJpeg = (mimeType: string, imageBuffer: Buffer) => {
    console.log('mimeType: ', mimeType);
    switch (mimeType) {
        case 'image/heic':
        case 'image/heif':
            return convert({
                buffer: imageBuffer,
                format: 'JPEG',
            });
        default:
            throw new BadRequestException('Invalid mime type');
    }
};
