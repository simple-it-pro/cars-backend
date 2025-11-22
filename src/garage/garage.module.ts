import { Module } from '@nestjs/common';
import {
    CarExpensesService,
    GarageService,
    ServiceRecordsService,
} from './services';
import {
    CarExpensesController,
    GarageController,
    ServiceRecordsController,
} from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import {
    Car,
    CarExpense,
    CarPhoto,
    FileEntity,
    ServiceRecord,
} from '../database/entities';
import { FilesModule } from '../files/files.module';
import { GarageFilesController } from './controllers/garage.files.controller';
import { FileUrlsService, StorageService } from '../storage/services';

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Car,
            CarPhoto,
            FileEntity,
            CarExpense,
            ServiceRecord,
        ]),
        FilesModule,
    ],
    controllers: [
        GarageController,
        GarageFilesController,
        CarExpensesController,
        ServiceRecordsController,
    ],
    providers: [
        GarageService,
        CarExpensesService,
        ServiceRecordsService,
        StorageService,
        FileUrlsService,
    ],
})
export class GarageModule {}
