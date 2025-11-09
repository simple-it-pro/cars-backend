import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

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
        if (!file) throw new NotFoundException('Файл не найден');

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
                return;
            }
        } catch (error) {
            this.logger.error('Error deleting file:', error);
            throw new InternalServerErrorException('Не удалось удалить файл');
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
