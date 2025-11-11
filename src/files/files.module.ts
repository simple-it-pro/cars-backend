import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { FilesService } from './services';
import { TmpFilesCleanupTask } from './tasks';
import { StorageModule } from '../storage/storage.module';
import { FileEntity } from '../database/entities';

@Module({
    imports: [StorageModule, TypeOrmModule.forFeature([FileEntity])],
    providers: [FilesService, TmpFilesCleanupTask],
    exports: [FilesService],
})
export class FilesModule {}
