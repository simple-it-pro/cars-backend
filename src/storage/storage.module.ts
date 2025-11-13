import { Module } from '@nestjs/common';

import { FileUrlsService, StorageService } from './services';

@Module({
    providers: [StorageService, FileUrlsService],
    exports: [StorageService, FileUrlsService],
})
export class StorageModule {}
