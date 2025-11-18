import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
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
import { FileUrlsService } from '../../storage/services';

@Injectable()
export class GarageService {
    private readonly logger = new Logger(GarageService.name);

    constructor(
        @InjectRepository(Car)
        private readonly carsRepository: Repository<Car>,
        private readonly filesService: FilesService,
        private readonly fileUrlsService: FileUrlsService,
    ) {}

    preUploadFile(file: FileWithFormat) {
        return this.filesService.preUploadFile(file);
    }

    async getAll(userId: string, status?: CarStatus) {
        const where: any = { owner: { id: userId } };

        if (status) where.status = status;

        const [cars, total] = await this.carsRepository.findAndCount({
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
        const car = await this.carsRepository.findOne({
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

    async create(userId: string, dto: CreateCarDto) {
        const car = this.carsRepository.create({
            ...dto,
            owner: { id: userId },
            status: CarStatus.WAREHOUSE,
        });

        const savedCar = await this.carsRepository.manager.transaction(
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

        if (car.status === CarStatus.LISTED)
            this.validateCarForSale({ ...car, ...dto });

        await this.carsRepository.update(carId, dto);
        const updatedCar = await this.getOne(userId, carId);

        this.logger.log(`User ${userId} updated car: ${carId}`);

        return {
            message: SUCCESS_MESSAGES.GARAGE.CAR.UPDATED,
            car: updatedCar,
        };
    }

    async delete(userId: string, carId: string) {
        const car = await this.getOne(userId, carId);

        const fileIds = car.photos.map((photo) => photo.file.id);

        await this.carsRepository.manager.transaction(async (manager) => {
            await manager.delete(CarPhoto, { carId: car.id });

            if (fileIds.length > 0) {
                await manager.update(FileEntity, fileIds, {
                    status: FileStatusEnum.TEMPORARY,
                });
            }

            await manager.delete(Car, car.id);
        });

        for (const fileId of fileIds) {
            try {
                await this.filesService.deleteFile(fileId);
            } catch (error) {
                this.logger.warn(
                    `Failed to delete file ${fileId}: ${error.message}`,
                );
            }
        }

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

        await this.carsRepository.update(carId, updateData);
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

        await this.carsRepository.manager.transaction(async (manager) => {
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
            },
        });

        const foundFileIds = files.map((file) => file.id);
        const notFoundFileIds = fileIds.filter(
            (fileId) => !foundFileIds.includes(fileId),
        );

        const notTemporaryFileIds = files
            .filter((file) => file.status !== FileStatusEnum.TEMPORARY)
            .map((file) => file.id);

        const invalidFileIds = [...notFoundFileIds, ...notTemporaryFileIds];

        if (invalidFileIds.length > 0)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.FILES_NOT_FOUND(
                    invalidFileIds.join(', '),
                ),
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

        const photo = car.photos.find((p) => p.file.id === fileId);
        if (!photo)
            throw new NotFoundException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_FOUND,
            );

        await this.carsRepository.manager.transaction(async (manager) => {
            await manager.update(FileEntity, fileId, {
                status: FileStatusEnum.TEMPORARY,
            });

            await manager.delete(CarPhoto, { id: photo.id });

            const remainingPhotos = await manager.find(CarPhoto, {
                where: { carId },
                order: { order: 'ASC' },
            });

            for (const [index, remainingPhoto] of remainingPhotos.entries()) {
                await manager.update(CarPhoto, remainingPhoto.id, {
                    order: index,
                });
            }
        });

        try {
            await this.filesService.deleteFile(fileId);
        } catch (error) {
            this.logger.warn(
                `Failed to delete file ${fileId}: ${error.message}`,
            );
        }

        const updatedCar = await this.getOne(userId, carId);

        return {
            message: SUCCESS_MESSAGES.GARAGE.PHOTO.DELETED,
            car: updatedCar,
        };
    }

    async reorderPhotos(carId: string, photoIds: string[], userId: string) {
        const car = await this.getUserCarAndCheckOwnership(userId, carId);

        if (photoIds.length !== car.photos.length)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_IDS_COUNT_MISMATCH,
            );

        const existingPhotoIds = new Set(car.photos.map((p) => p.id));

        const nonExistingPhotoIds = photoIds.reduce((acc, photoId) => {
            if (!existingPhotoIds.has(photoId)) return [...acc, photoId];
            return acc;
        }, []);

        if (nonExistingPhotoIds.length > 0) {
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.PHOTO_NOT_BELONGS_TO_CAR(
                    nonExistingPhotoIds.join(', '),
                ),
            );
        }

        const carPhotosToUpdate = photoIds.map((photoId, index) =>
            this.carsRepository.manager.create(CarPhoto, {
                id: photoId,
                order: index,
            }),
        );

        await this.carsRepository.manager.save(CarPhoto, carPhotosToUpdate);

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
        const car = await this.carsRepository.findOne({
            where: { id: carId, owner: { id: userId } },
            relations: ['photos', 'photos.file'],
        });

        if (!car)
            throw new NotFoundException(ERROR_MESSAGES.GARAGE.CAR.NOT_FOUND);

        return car;
    }

    private async addSignedUrlsToCar(car: Car): Promise<Car> {
        const userWithUrl = await this.fileUrlsService.addSignedUrlsDeep(
            car.owner,
        );

        if (!car.photos || car.photos.length === 0)
            return { ...car, owner: userWithUrl };

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
            owner: userWithUrl,
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

        if (missingFields.length > 0)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.MISSING_REQUIRED_FIELDS_FOR_PUBLICATION(
                    missingFields as string[],
                ),
            );

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

        if (missingFields.length > 0)
            throw new BadRequestException(
                ERROR_MESSAGES.GARAGE.CAR.CANNOT_REMOVE_REQUIRED_FIELDS_FOR_SALE(
                    missingFields as string[],
                ),
            );
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
                ERROR_MESSAGES.GARAGE.CAR.INVALID_STATUS_TRANSITION,
            );
        }
    }
}
