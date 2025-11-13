import { Module } from '@nestjs/common';
import { GarageService } from './services';
import { GarageController } from './controllers';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Car, CarPhoto, FileEntity } from '../database/entities';

@Module({
    imports: [TypeOrmModule.forFeature([Car, CarPhoto, FileEntity])],
    controllers: [GarageController],
    providers: [GarageService],
})
export class GarageModule {}
