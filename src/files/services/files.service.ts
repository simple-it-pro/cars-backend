import {
    Injectable,
    Logger,
    InternalServerErrorException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { getFileTypeFromMime } from '../utils';
import { FileWithFormat } from '../interfaces';
import { StorageService } from '../../storage/services';
import { FileEntity } from '../../database/entities';
import { FileStatusEnum } from '../../database/enums';

@Injectable()
export class FilesService {
    private readonly logger = new Logger(FilesService.name);

    constructor(
        @InjectRepository(FileEntity)
        private readonly filesRepository: Repository<FileEntity>,
        private readonly storageService: StorageService,
    ) {}

    async preUploadFile(file: FileWithFormat) {
        const uploadedFileKey = await this.storageService.uploadFile(file);

        const fileEntity = this.filesRepository.create({
            name: file.originalname,
            size: file.size,
            ext: file.ext,
            type: getFileTypeFromMime(file.realMime),
            status: FileStatusEnum.TEMPORARY,
            url: uploadedFileKey,
        });

        const savedFile = await this.filesRepository.save(fileEntity);

        const signedUrl = await this.storageService.getFileUrl(uploadedFileKey);
        return { ...savedFile, url: signedUrl };
    }

    async deleteFile(id: string) {
        const file = await this.filesRepository.findOne({ where: { id } });
        if (!file) throw new NotFoundException(ERROR_MESSAGES.FILE.NOT_FOUND);

        try {
            if (file.url) {
                await this.filesRepository.manager.transaction(
                    async (manager: EntityManager) => {
                        await manager.delete(FileEntity, id);
                        await this.storageService.deleteFile(file.url!);
                    },
                );
            } else {
                await this.filesRepository.delete(id);
                return SUCCESS_MESSAGES.FILE.DELETED;
            }
        } catch (error) {
            this.logger.error('Error deleting file:', error);
            throw new InternalServerErrorException(
                ERROR_MESSAGES.FILE.DELETION_FAILED,
            );
        }
    }

    async addSignedUrlToFile(file: FileEntity): Promise<FileEntity> {
        if (!file.url) return file;
        const signedUrl = await this.storageService.getFileUrl(file.url);
        return { ...file, url: signedUrl };
    }

    async addSignedUrlsToFiles(files: FileEntity[]): Promise<FileEntity[]> {
        if (!(files && files.length)) return files;

        return Promise.all(
            files.map(async (file) => this.addSignedUrlToFile(file)),
        );
    }
}
