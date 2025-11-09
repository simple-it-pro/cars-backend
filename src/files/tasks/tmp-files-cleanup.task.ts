import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, Repository } from 'typeorm';
import { DateTime } from 'luxon';

import { StorageService } from '../../storage/services';
import { FileEntity } from '../../database/entities';
import { FileStatusEnum } from '../../database/enums';

@Injectable()
export class TmpFilesCleanupTask {
    private readonly logger = new Logger(TmpFilesCleanupTask.name);

    constructor(
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
        private readonly storageService: StorageService,
    ) {}

    @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
    async handleCron() {
        this.logger.log('Temporary files cleanup task started');

        const date = DateTime.now().minus({ days: 1 }).toJSDate();
        let page = 0;

        while (true) {
            const files = await this.fileRepository.find({
                where: {
                    status: FileStatusEnum.TEMPORARY,
                    createdAt: LessThan(date),
                },
                order: {
                    createdAt: 'DESC',
                },
                take: 1000,
                skip: page * 1000,
            });

            console.log(`Files count at page ${page}: ${files.length}`);

            if (files.length === 0) break;

            page += 1;

            for (const file of files) {
                if (file.url) {
                    await this.storageService.deleteFile(file.url);
                    await this.fileRepository.delete(file.id);
                }
            }
        }

        this.logger.log('Temporary files cleanup task completed');
    }
}
