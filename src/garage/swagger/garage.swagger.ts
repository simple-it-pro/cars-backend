import {
    ApiBodyOptions,
    ApiOperationOptions,
    ApiParamOptions,
    ApiQueryOptions,
    ApiResponseOptions,
} from '@nestjs/swagger';
import {
    Bodyworks,
    CarStatus,
    FuelTypes,
    TransmissionTypes,
} from '../../database/enums/cars';
import { UpdateCarDto } from '../dto';
import { Car, FileEntity } from '../../database/entities';

export const GARAGE_BODIES = {
    CREATE_CAR: {
        description: 'Данные для создания автомобиля',
        schema: {
            type: 'object',
            properties: {
                make: {
                    type: 'string',
                    example: 'Toyota',
                    description: 'Марка автомобиля',
                },
                model: {
                    type: 'string',
                    example: 'Camry',
                    description: 'Модель автомобиля',
                },
                year: {
                    type: 'number',
                    example: 2020,
                    description: 'Год выпуска',
                },
                bodywork: {
                    type: 'string',
                    example: Bodyworks.SEDAN,
                    description: 'Тип кузова',
                    nullable: true,
                },
                fuelType: {
                    type: 'string',
                    example: FuelTypes.PETROL,
                    description: 'Тип топлива',
                    nullable: true,
                },
                transmission: {
                    type: 'string',
                    example: TransmissionTypes.AT,
                    description: 'Тип трансмиссии',
                    nullable: true,
                },
                mileageKm: {
                    type: 'number',
                    example: 50000,
                    description: 'Пробег в км',
                    nullable: true,
                },
                photoIds: {
                    type: 'array',
                    items: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    description: 'Массив ID предварительно загруженных фото',
                    maxItems: 10,
                    nullable: true,
                },
            },
            required: ['make', 'model', 'year'],
        },
    } as ApiBodyOptions,

    UPDATE_CAR: {
        description: 'Данные для обновления автомобиля',
        type: UpdateCarDto,
    } as ApiBodyOptions,

    PRE_UPLOAD: {
        description: 'Файл для предварительной загрузки',
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Изображение автомобиля (JPG, PNG, WebP)',
                },
            },
            required: ['file'],
        },
    } as ApiBodyOptions,

    CHANGE_CAR_STATUS: {
        description: 'Данные для изменения статуса автомобиля',
        schema: {
            type: 'object',
            properties: {
                status: {
                    type: 'string',
                    description: 'Новый статус автомобиля',
                    enum: CarStatus,
                    example: CarStatus.LISTED,
                },
                price: {
                    type: 'number',
                    description: 'Цена (обязательно при публикации)',
                    example: 1250000,
                    nullable: true,
                },
            },
            required: ['status'],
        },
    } as ApiBodyOptions,

    ATTACH_CAR_PHOTOS: {
        description: 'Данные для прикрепления фото к автомобилю',
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    description: 'Массив ID предварительно загруженных файлов',
                    items: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    maxItems: 10,
                },
            },
            required: ['fileIds'],
        },
    } as ApiBodyOptions,

    REORDER_CAR_PHOTOS: {
        description: 'Данные для изменения порядка фото',
        schema: {
            type: 'object',
            properties: {
                fileIds: {
                    type: 'array',
                    description: 'Массив ID файлов в новом порядке',
                    items: {
                        type: 'string',
                        format: 'uuid',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                },
            },
            required: ['fileIds'],
        },
    } as ApiBodyOptions,
} as const;

export const GARAGE_API_DOCS = {
    OPERATIONS: {
        CREATE_CAR: {
            summary: 'Добавить автомобиль в гараж',
            description:
                'Создает новый автомобиль и добавляет его в гараж пользователя',
        } as ApiOperationOptions,

        GET_ALL_CARS: {
            summary: 'Получить все автомобили',
            description:
                'Возвращает список всех автомобилей пользователя с возможностью фильтрации по статусу',
        } as ApiOperationOptions,

        GET_CAR: {
            summary: 'Получить автомобиль по ID',
            description:
                'Возвращает полную информацию об автомобиле по его идентификатору',
        } as ApiOperationOptions,

        UPDATE_CAR: {
            summary: 'Обновить автомобиль',
            description: 'Обновляет информацию об автомобиле',
        } as ApiOperationOptions,

        DELETE_CAR: {
            summary: 'Удалить автомобиль',
            description: 'Удаляет автомобиль из гаража',
        } as ApiOperationOptions,

        CHANGE_CAR_STATUS: {
            summary: 'Изменить статус автомобиля',
            description: 'Изменяет статус автомобиля (склад/продажа/архив)',
        } as ApiOperationOptions,

        ATTACH_CAR_PHOTOS: {
            summary: 'Прикрепить фото к автомобилю',
            description:
                'Прикрепляет предварительно загруженные фото к автомобилю по их ID',
        } as ApiOperationOptions,

        REMOVE_CAR_PHOTO: {
            summary: 'Удалить фото автомобиля',
            description: 'Удаляет конкретное фото автомобиля по ID файла',
        } as ApiOperationOptions,

        REORDER_CAR_PHOTOS: {
            summary: 'Изменить порядок фото',
            description: 'Изменяет порядок отображения фотографий автомобиля',
        } as ApiOperationOptions,

        PRE_UPLOAD: {
            summary: 'Предварительно загрузить файл',
            description: 'Предварительная загрузка файла для автомобиля',
        } as ApiOperationOptions,
    },

    PARAMS: {
        CAR_ID: {
            name: 'id',
            description: 'ID автомобиля',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,

        FILE_ID: {
            name: 'fileId',
            description: 'ID файла',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,
    },

    QUERIES: {
        STATUS_OPTIONAL: {
            name: 'status',
            description: 'Необязательный фильтр по статусу автомобиля',
            enum: CarStatus,
            required: false,
            example: CarStatus.WAREHOUSE,
        } as ApiQueryOptions,
    },

    RESPONSES: {
        CREATE_CAR: {
            description: 'Автомобиль успешно создан',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль успешно добавлен в гараж',
                    },
                    car: { $ref: '#/components/schemas/Car' },
                },
            },
        } as ApiResponseOptions,

        GET_ALL_CARS: {
            description: 'Список автомобилей успешно получен',
            schema: {
                type: 'object',
                properties: {
                    cars: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/Car' },
                    },
                    total: {
                        type: 'number',
                        example: 5,
                        description: 'Общее количество автомобилей',
                    },
                },
            },
        } as ApiResponseOptions,

        GET_CAR: {
            description: 'Автомобиль успешно получен',
            type: Car,
        } as ApiResponseOptions,

        UPDATE_CAR: {
            description: 'Автомобиль успешно обновлен',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль успешно обновлен',
                    },
                    car: { $ref: '#/components/schemas/Car' },
                },
            },
        } as ApiResponseOptions,

        DELETE_CAR: {
            description: 'Автомобиль успешно удален',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль успешно удален',
                    },
                },
            },
        } as ApiResponseOptions,

        CHANGE_CAR_STATUS: {
            description: 'Статус автомобиля успешно изменен',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Статус автомобиля успешно изменен',
                    },
                    car: { $ref: '#/components/schemas/Car' },
                },
            },
        } as ApiResponseOptions,

        ATTACH_CAR_PHOTOS: {
            description: 'Фото успешно прикреплены',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Фото успешно прикреплены',
                    },
                    car: { $ref: '#/components/schemas/Car' },
                },
            },
        } as ApiResponseOptions,

        REMOVE_CAR_PHOTO: {
            description: 'Фото успешно удалено',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Фото успешно удалено',
                    },
                },
            },
        } as ApiResponseOptions,

        REORDER_CAR_PHOTOS: {
            description: 'Порядок фото успешно изменен',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Порядок фото успешно изменен',
                    },
                },
            },
        } as ApiResponseOptions,

        PRE_UPLOAD_SUCCESS: {
            description: 'Файл успешно предварительно загружен',
            type: FileEntity,
        } as ApiResponseOptions,

        UNAUTHORIZED: {
            description: 'Пользователь не авторизован',
            status: 401,
        } as ApiResponseOptions,

        NOT_FOUND: {
            description: 'Автомобиль не найден',
            status: 404,
        } as ApiResponseOptions,

        PHOTO_NOT_FOUND: {
            description: 'Фото не найдено',
            status: 404,
        } as ApiResponseOptions,

        BAD_REQUEST: {
            description: 'Неверные данные',
            status: 400,
        } as ApiResponseOptions,

        INVALID_STATUS_TRANSITION: {
            description: 'Недопустимый переход между статусами',
            status: 400,
        } as ApiResponseOptions,

        TOO_MANY_PHOTOS: {
            description: 'Слишком много фото',
            status: 400,
        } as ApiResponseOptions,

        FILES_NOT_FOUND: {
            description: 'Файлы не найдены',
            status: 400,
        } as ApiResponseOptions,

        FILE_TOO_LARGE: {
            description: 'Файл слишком большой',
            status: 413,
        } as ApiResponseOptions,

        INVALID_FILE_TYPE: {
            description: 'Неверный формат файла',
            status: 400,
        } as ApiResponseOptions,
    },
} as const;
