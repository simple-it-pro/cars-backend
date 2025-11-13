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

@Module({
    imports: [
        TypeOrmModule.forFeature([
            Car,
            CarPhoto,
            FileEntity,
            CarExpense,
            ServiceRecord,
        ]),
    ],
    controllers: [
        GarageController,
        CarExpensesController,
        ServiceRecordsController,
    ],
    providers: [GarageService, CarExpensesService, ServiceRecordsService],
})
export class GarageModule {}
