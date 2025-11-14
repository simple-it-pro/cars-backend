import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Car, ServiceRecord } from '../../database/entities';
import { CreateServiceRecordDto, UpdateServiceRecordDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';

@Injectable()
export class ServiceRecordsService {
    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        @InjectRepository(ServiceRecord)
        private readonly recordRepository: Repository<ServiceRecord>,
    ) {}

    private async getUserCar(userId: string, carId: string): Promise<Car> {
        const car = await this.carRepository.findOne({
            where: { id: carId, owner: { id: userId } },
        });

        if (!car) {
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);
        }

        return car;
    }

    async getAll(userId: string, carId: string) {
        await this.getUserCar(userId, carId);

        const records = await this.recordRepository.find({
            where: { carId },
            order: { serviceDate: 'DESC', createdAt: 'DESC' },
        });

        return {
            records,
            total: records.length,
        };
    }

    async getOne(userId: string, carId: string, recordId: string) {
        await this.getUserCar(userId, carId);

        const record = await this.recordRepository.findOne({
            where: { id: recordId, carId },
        });

        if (!record)
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.SERVICE_RECORD.NOT_FOUND,
            );

        return record;
    }

    async create(userId: string, carId: string, dto: CreateServiceRecordDto) {
        const car = await this.getUserCar(userId, carId);

        const record = this.recordRepository.create({
            ...dto,
            carId: car.id,
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
        await this.getUserCar(userId, carId);

        const record = await this.recordRepository.findOne({
            where: { id: recordId, carId },
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
        await this.getUserCar(userId, carId);

        const result = await this.recordRepository.delete({
            id: recordId,
            carId,
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
