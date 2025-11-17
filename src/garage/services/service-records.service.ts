import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { ServiceRecord } from '../../database/entities';
import { CreateServiceRecordDto, UpdateServiceRecordDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { GarageService } from './garage.service';

@Injectable()
export class ServiceRecordsService {
    constructor(
        @InjectRepository(ServiceRecord)
        private readonly recordRepository: Repository<ServiceRecord>,
        private readonly garageService: GarageService,
    ) {}

    async getAll(userId: string, carId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const [records, total] = await this.recordRepository.findAndCount({
            where: { car: { id: carId } },
            order: { serviceDate: 'DESC', createdAt: 'DESC' },
        });

        return {
            records,
            total,
        };
    }

    async getOne(userId: string, carId: string, recordId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const record = await this.recordRepository.findOne({
            where: { id: recordId, car: { id: carId } },
        });

        if (!record)
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.SERVICE_RECORD.NOT_FOUND,
            );

        return record;
    }

    async create(userId: string, carId: string, dto: CreateServiceRecordDto) {
        const car = await this.garageService.getUserCarAndCheckOwnership(
            userId,
            carId,
        );

        const record = this.recordRepository.create({
            ...dto,
            car,
        });

        const saved = await this.recordRepository.save(record);

        return {
            message: SUCCESS_MESSAGES.GARAGE.SERVICE_RECORD.CREATED,
            record: saved,
        };
    }

    async update(
        userId: string,
        carId: string,
        recordId: string,
        dto: UpdateServiceRecordDto,
    ) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const record = await this.recordRepository.findOne({
            where: { id: recordId, car: { id: carId } },
        });

        if (!record)
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.SERVICE_RECORD.NOT_FOUND,
            );

        Object.assign(record, dto);

        const updated = await this.recordRepository.save(record);

        return {
            message: SUCCESS_MESSAGES.GARAGE.SERVICE_RECORD.UPDATED,
            record: updated,
        };
    }

    async delete(userId: string, carId: string, recordId: string) {
        await this.garageService.getUserCarAndCheckOwnership(userId, carId);

        const result = await this.recordRepository.delete({
            id: recordId,
            car: { id: carId },
        });

        if (!result.affected) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.SERVICE_RECORD.NOT_FOUND,
            );
        }

        return {
            message: SUCCESS_MESSAGES.GARAGE.SERVICE_RECORD.DELETED,
        };
    }
}
