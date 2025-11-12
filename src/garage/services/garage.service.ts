import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { CreateCarDto, UpdateCarDto } from '../dto';
import { CarStatus } from '../../database/enums/cars';
import { InjectRepository } from '@nestjs/typeorm';
import { Car } from '../../database/entities/';
import { Repository } from 'typeorm';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';

@Injectable()
export class GarageService {
    private readonly logger = new Logger(GarageService.name);

    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
    ) {}

    async getAll(userId: string, status?: CarStatus) {
        const where: any = { owner: { id: userId } };
        if (status) {
            where.status = status;
        }

        const cars = await this.carRepository.find({
            where,
            relations: ['owner'],
            order: { createdAt: 'DESC' },
        });

        this.logger.log(
            `User ${userId} retrieved ${cars.length} cars${status ? ` with status ${status}` : ''}`,
        );

        return {
            cars,
            total: cars.length,
        };
    }

    async getOne(userId: string, carId: string) {
        const car = await this.carRepository.findOne({
            where: {
                id: carId,
                owner: { id: userId },
            },
            relations: ['owner'],
        });

        if (!car) {
            this.logger.warn(
                `User ${userId} attempted to access non-existent car ${carId}`,
            );
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);
        }

        this.logger.log(`User ${userId} retrieved car ${carId}`);
        return car;
    }

    async create(userId: string, dto: CreateCarDto) {
        const car = this.carRepository.create({
            ...dto,
            owner: { id: userId },
            status: CarStatus.WAREHOUSE,
        });

        const savedCar = await this.carRepository.save(car);

        this.logger.log(
            `User ${userId} created new car: ${savedCar.id} - ${savedCar.make} ${savedCar.model}`,
        );

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.CREATED,
            car: savedCar,
        };
    }

    async update(userId: string, carId: string, dto: UpdateCarDto) {
        const car = await this.getOne(userId, carId);

        if (car.status === CarStatus.LISTED) {
            this.validateCarForSale({ ...car, ...dto });
        }

        await this.carRepository.update(carId, dto);
        const updatedCar = await this.getOne(userId, carId);

        this.logger.log(`User ${userId} updated car: ${carId}`);

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.UPDATED,
            car: updatedCar,
        };
    }

    async delete(userId: string, carId: string) {
        const car = await this.getOne(userId, carId);

        await this.carRepository.remove(car);

        this.logger.log(`User ${userId} deleted car: ${carId}`);

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.DELETED,
        };
    }

    async changeStatus(
        userId: string,
        carId: string,
        status: CarStatus,
        price?: number,
    ) {
        const car = await this.getOne(userId, carId);

        this.validateStatusTransition(car.status, status);

        const updateData: Partial<Car> = { status };

        if (status === CarStatus.LISTED) {
            if (!price) {
                throw new BadRequestException(
                    'Price is required when putting car for sale',
                );
            }
            this.validateCarForPublication(car);
            updateData.price = price;

            // TODO: Здесь будет интеграция с сервисом объявлений
            this.logger.log(
                `Car ${carId} prepared for sale with price: ${price}`,
            );
        } else if (status === CarStatus.ARCHIVED) {
            updateData.price = null;
            this.logger.log(`Car ${carId} moved to archive`);
        } else if (status === CarStatus.WAREHOUSE) {
            updateData.price = null;
            this.logger.log(`Car ${carId} moved to warehouse`);
        }

        await this.carRepository.update(carId, updateData);
        const updatedCar = await this.getOne(userId, carId);

        this.logger.log(
            `User ${userId} changed status of car ${carId} from ${car.status} to ${status}`,
        );

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.STATUS_CHANGED,
            car: updatedCar,
        };
    }

    async getCarsByStatus(userId: string, status: CarStatus) {
        return this.getAll(userId, status);
    }

    private validateStatusTransition(
        currentStatus: CarStatus,
        newStatus: CarStatus,
    ) {
        const allowedTransitions = {
            [CarStatus.WAREHOUSE]: [CarStatus.LISTED, CarStatus.ARCHIVED],
            [CarStatus.LISTED]: [CarStatus.ARCHIVED, CarStatus.WAREHOUSE],
            [CarStatus.ARCHIVED]: [CarStatus.WAREHOUSE, CarStatus.LISTED],
        };

        if (!allowedTransitions[currentStatus]?.includes(newStatus)) {
            throw new BadRequestException(
                `Cannot change status from ${currentStatus} to ${newStatus}`,
            );
        }
    }

    private validateCarForPublication(car: Car) {
        const requiredFields = [
            'make',
            'model',
            'year',
            'bodywork',
            'fuelType',
            'transmission',
            'mileageKm',
        ];

        const missingFields = requiredFields.filter((field) => !car[field]);

        if (missingFields.length > 0) {
            throw new BadRequestException(
                `Missing required fields for publication: ${missingFields.join(', ')}`,
            );
        }

        this.logger.log(`Car ${car.id} validated for publication`);
    }

    private validateCarForSale(car: Partial<Car>) {
        const requiredFields = [
            'make',
            'model',
            'year',
            'bodywork',
            'fuelType',
            'transmission',
            'mileageKm',
            'price',
        ];

        const missingFields = requiredFields.filter((field) => !car[field]);

        if (missingFields.length > 0) {
            throw new BadRequestException(
                `Cannot remove required fields for car on sale: ${missingFields.join(', ')}`,
            );
        }
    }
}
