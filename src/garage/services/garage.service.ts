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
import { CarPhoto, FileEntity } from '../../database/entities';
import { FileStatusEnum, FileTypeEnum } from '../../database/enums';

@Injectable()
export class GarageService {
    private readonly logger = new Logger(GarageService.name);

    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        @InjectRepository(CarPhoto)
        private readonly carPhotoRepository: Repository<CarPhoto>,
        @InjectRepository(FileEntity)
        private readonly fileRepository: Repository<FileEntity>,
    ) {}

    async getAll(userId: string, status?: CarStatus) {
        const where: any = { owner: { id: userId } };

        if (status) where.status = status;

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

        const updateData: Partial<Car> = { status };

        if (status === CarStatus.LISTED) {
            if (!price)
                throw new BadRequestException(
                    ERROR_MESSAGES.GARAGE.CAR.PRICE_REQUIRED,
                );

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

    async addPhotos(
        carId: string,
        userId: string,
        photos: Express.Multer.File[],
    ) {
        const car = await this.getOne(userId, carId);

        if (!photos || photos.length === 0)
            throw new BadRequestException(ERROR_MESSAGES.GARAGE.CAR.NO_PHOTOS);

        if (car.photos.length + photos.length > 10)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.PHOTO.TOO_MANY_PHOTOS,
            );

        const lastOrder =
            car.photos.length > 0
                ? Math.max(...car.photos.map((p) => p.order))
                : -1;

        const newEntities: CarPhoto[] = [];

        for (const [index, file] of photos.entries()) {
            if (!file.mimetype.startsWith('image/')) {
                throw new BadRequestException(
                    ERROR_MESSAGES.GARAGE.PHOTO.INVALID_FILE_TYPE,
                );
            }

            const ext = file.originalname.split('.').pop() || '';

            const fileEntity = this.fileRepository.create({
                name: file.originalname,
                ext,
                size: file.size,
                type: FileTypeEnum.IMAGE,
                status: FileStatusEnum.ATTACHED,
                url: file.filename,
            });

            const savedFile = await this.fileRepository.save(fileEntity);

            const carPhoto = this.carPhotoRepository.create({
                carId: car.id,
                fileId: savedFile.id,
                order: lastOrder + index + 1,
            });

            newEntities.push(carPhoto);
        }

        await this.carPhotoRepository.save(newEntities);

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.UPLOADED,
            car: updatedCar,
        };
    }

    async removePhoto(carId: string, photoId: string, userId: string) {
        const car = await this.getOne(userId, carId);

        const photo = car.photos.find((p) => p.id === photoId);
        if (!photo) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_FOUND,
            );
        }

        await this.carPhotoRepository.delete(photoId);
        await this.fileRepository.delete(photo.fileId);

        const sorted = (
            await this.carPhotoRepository.find({
                where: { carId },
                order: { order: 'ASC' },
            })
        ).map((p, i) => ({ ...p, order: i }));

        await this.carPhotoRepository.save(sorted);

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.DELETED,
            car: updatedCar,
        };
    }

    async reorderPhotos(carId: string, photoIds: string[], userId: string) {
        const car = await this.getOne(userId, carId);

        if (photoIds.length !== car.photos.length) {
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_IDS_COUNT_MISMATCH,
            );
        }

        const existingIds = new Set(car.photos.map((p) => p.id));
        for (const id of photoIds) {
            if (!existingIds.has(id)) {
                throw new BadRequestException(
                    ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_BELONGS_TO_CAR(id),
                );
            }
        }

        const reordered = photoIds.map((id, index) => ({
            id,
            order: index,
        }));

        for (const { id, order } of reordered) {
            await this.carPhotoRepository.update(id, { order });
        }

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.REORDERED,
            car: updatedCar,
        };
    }

    private validateCarForPublication(car: Car) {
        const requiredFields: (keyof Car)[] = [
            'make',
            'model',
            'year',
            'bodywork',
            'fuelType',
            'transmission',
            'mileageKm',
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = car[field];
            return value === null || value === undefined;
        });

        if (missingFields.length > 0) {
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.MISSING_REQUIRED_FIELDS_FOR_PUBLICATION(
                    missingFields as string[],
                ),
            );
        }

        this.logger.log(`Car ${car.id} validated for publication`);
    }

    private validateCarForSale(car: Partial<Car>) {
        const requiredFields: (keyof Car)[] = [
            'make',
            'model',
            'year',
            'bodywork',
            'fuelType',
            'transmission',
            'mileageKm',
            'price',
        ];

        const missingFields = requiredFields.filter((field) => {
            const value = car[field];
            return value === null || value === undefined;
        });

        if (missingFields.length > 0) {
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.CANNOT_REMOVE_REQUIRED_FIELDS_FOR_SALE(
                    missingFields as string[],
                ),
            );
        }
    }
}
