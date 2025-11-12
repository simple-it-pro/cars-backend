import { Module } from '@nestjs/common';
import { GarageService } from './services/garage.service';
import { GarageController } from './controllers/garage.controller';

@Module({
    controllers: [GarageController],
    providers: [GarageService],
})
export class GarageModule {}
