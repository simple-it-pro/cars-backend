import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Logger,
} from '@nestjs/common';
import { CreateCarDto, UpdateCarDto } from '../dto';
import { CarStatus } from '../../database/enums/cars';
import { InjectRepository } from '@nestjs/typeorm';
import { Car, CarPhoto, FileEntity } from '../../database/entities/';
import { EntityManager, In, Repository } from 'typeorm';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { FileStatusEnum } from '../../database/enums';
import { FilesService } from '../../files/services';
import { FileWithFormat } from '../../files/interfaces';

@Injectable()
export class GarageService {
    private readonly logger = new Logger(GarageService.name);

    constructor(
        @InjectRepository(Car)
        private readonly carRepository: Repository<Car>,
        private readonly filesService: FilesService,
    ) {}

    preUploadFile(file: FileWithFormat) {
        return this.filesService.preUploadFile(file);
    }

    async getAll(userId: string, status?: CarStatus) {
        const where: any = { owner: { id: userId } };

        if (status) where.status = status;

        const [cars, total] = await this.carRepository.findAndCount({
            where,
            relations: ['owner', 'photos', 'photos.file'],
            order: { createdAt: 'DESC' },
        });

        const carsWithSignedUrls = await Promise.all(
            cars.map((car) => this.addSignedUrlsToCar(car)),
        );

        this.logger.log(
            `User ${userId} retrieved ${total} cars${status ? ` with status ${status}` : ''}`,
        );

        return {
            cars: carsWithSignedUrls,
            total,
        };
    }

    async getOne(userId: string, carId: string) {
        const car = await this.carRepository.findOne({
            where: {
                id: carId,
                owner: { id: userId },
            },
            relations: ['owner', 'photos', 'photos.file'],
        });

        if (!car) {
            this.logger.warn(
                `User ${userId} attempted to access non-existent car ${carId}`,
            );
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);
        }

        const carWithSignedUrls = await this.addSignedUrlsToCar(car);

        this.logger.log(`User ${userId} retrieved car ${carId}`);
        return carWithSignedUrls;
    }

    async create(userId: string, dto: CreateCarDto & { photoIds?: string[] }) {
        const car = this.carRepository.create({
            ...dto,
            owner: { id: userId },
            status: CarStatus.WAREHOUSE,
        });

        const savedCar = await this.carRepository.manager.transaction(
            async (manager) => {
                const savedCar = await manager.save(Car, car);

                if (dto.photoIds && dto.photoIds.length > 0) {
                    await this.attachPhotosInternal(
                        manager,
                        savedCar.id,
                        dto.photoIds,
                    );
                }

                return savedCar;
            },
        );

        this.logger.log(
            `User ${userId} created new car: ${savedCar.id} - ${savedCar.make} ${savedCar.model}`,
        );

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.CREATED,
            car: await this.getOne(userId, savedCar.id),
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

        await this.carRepository.manager.transaction(async (manager) => {
            await manager.delete(CarPhoto, { carId: car.id });

            const fileIds = car.photos.map((photo) => photo.file.id);
            if (fileIds.length > 0) {
                await manager.delete(FileEntity, fileIds);
            }

            await manager.delete(Car, car.id);
        });

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

        switch (status) {
            case CarStatus.LISTED:
                if (!price)
                    throw new BadRequestException(
                        ERROR_MESSAGES.GARAGE.CAR.PRICE_REQUIRED,
                    );

                this.validateCarForPublication(car);
                updateData.price = price;

                this.logger.log(
                    `Car ${carId} prepared for sale with price: ${price}`,
                );
                break;
            case CarStatus.ARCHIVED:
                updateData.price = null;
                this.logger.log(`Car ${carId} moved to archive`);
                break;
            case CarStatus.WAREHOUSE:
                updateData.price = null;
                this.logger.log(`Car ${carId} moved to warehouse`);
                break;
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

    async attachPhotos(carId: string, userId: string, fileIds: string[]) {
        await this.getUserCarAndCheckOwnership(userId, carId);

        await this.carRepository.manager.transaction(async (manager) => {
            await this.attachPhotosInternal(manager, carId, fileIds);
        });

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.ATTACHED,
            car: updatedCar,
        };
    }

    private async attachPhotosInternal(
        manager: EntityManager,
        carId: string,
        fileIds: string[],
    ) {
        const currentPhotos = await manager.find(CarPhoto, {
            where: { carId },
        });

        if (currentPhotos.length + fileIds.length > 10)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.PHOTO.TOO_MANY_PHOTOS,
            );

        const files = await manager.find(FileEntity, {
            where: {
                id: In(fileIds),
                status: FileStatusEnum.TEMPORARY,
            },
        });

        if (files.length !== fileIds.length)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.FILES_NOT_FOUND,
            );

        const lastOrder =
            currentPhotos.length > 0
                ? Math.max(...currentPhotos.map((p) => p.order))
                : -1;

        const newCarPhotos = fileIds.map((fileId, index) =>
            manager.create(CarPhoto, {
                carId,
                fileId,
                order: lastOrder + index + 1,
            }),
        );

        await manager.save(CarPhoto, newCarPhotos);

        await manager.update(FileEntity, fileIds, {
            status: FileStatusEnum.ATTACHED,
        });
    }

    async removePhoto(carId: string, fileId: string, userId: string) {
        const car = await this.getUserCarAndCheckOwnership(userId, carId);

        const photo = car.photos?.find((p) => p.file.id === fileId);
        if (!photo) {
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_FOUND,
            );
        }

        await this.carRepository.manager.transaction(async (manager) => {
            await manager.delete(CarPhoto, { carId, fileId });

            await this.filesService.deleteFile(fileId);

            const remainingPhotos = await manager.find(CarPhoto, {
                where: { carId },
                order: { order: 'ASC' },
            });

            const reorderedPhotos = remainingPhotos.map((photo, index) => ({
                ...photo,
                order: index,
            }));

            await manager.save(CarPhoto, reorderedPhotos);
        });

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.DELETED,
            car: updatedCar,
        };
    }

    async reorderPhotos(carId: string, fileIds: string[], userId: string) {
        const car = await this.getUserCarAndCheckOwnership(userId, carId);

        if (fileIds.length !== car.photos.length) {
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_IDS_COUNT_MISMATCH,
            );
        }

        const existingFileIds = new Set(car.photos.map((p) => p.file.id));
        for (const fileId of fileIds) {
            if (!existingFileIds.has(fileId)) {
                throw new BadRequestException(
                    ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_BELONGS_TO_CAR(fileId),
                );
            }
        }

        await this.carRepository.manager.transaction(async (manager) => {
            for (const [index, fileId] of fileIds.entries()) {
                await manager.update(
                    CarPhoto,
                    { carId, fileId },
                    { order: index },
                );
            }
        });

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.REORDERED,
            car: updatedCar,
        };
    }

    async getUserCarAndCheckOwnership(
        userId: string,
        carId: string,
    ): Promise<Car> {
        const car = await this.carRepository.findOne({
            where: { id: carId, owner: { id: userId } },
            relations: ['photos', 'photos.file'],
        });

        if (!car) {
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);
        }

        return car;
    }

    private async addSignedUrlsToCar(car: Car): Promise<Car> {
        if (!car.photos || car.photos.length === 0) {
            return car;
        }

        const photos = car.photos.sort((a, b) => a.order - b.order);
        const files = photos.map((photo) => photo.file);

        const filesWithUrls =
            await this.filesService.addSignedUrlsToFiles(files);

        const photosWithSignedUrls = photos.map((photo, index) => ({
            ...photo,
            file: filesWithUrls[index],
        }));

        return {
            ...car,
            photos: photosWithSignedUrls,
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
