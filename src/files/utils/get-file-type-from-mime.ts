import { FileTypeEnum } from '../../database/enums';

export const getFileTypeFromMime = (mime: string): FileTypeEnum => {
    if (mime.startsWith('image/')) return FileTypeEnum.IMAGE;
    if (mime.startsWith('video/')) return FileTypeEnum.VIDEO;
    if (mime.startsWith('audio/')) return FileTypeEnum.VOICE;
    return FileTypeEnum.FILE;
};
