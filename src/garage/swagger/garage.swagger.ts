import {
    ApiBodyOptions,
    ApiOperationOptions,
    ApiParamOptions,
    ApiQueryOptions,
    ApiResponseOptions,
} from '@nestjs/swagger';
import { CarStatus } from '../../database/enums/cars';
import { CreateCarDto, UpdateCarDto } from '../dto';

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
        ADD_CAR_PHOTOS: {
            summary: 'Добавить фото автомобиля',
            description:
                'Добавляет фотографии к автомобилю (максимум 10 файлов)',
        } as ApiOperationOptions,
        REMOVE_CAR_PHOTO: {
            summary: 'Удалить фото автомобиля',
            description: 'Удаляет конкретное фото автомобиля',
        } as ApiOperationOptions,
        REORDER_CAR_PHOTOS: {
            summary: 'Изменить порядок фото',
            description: 'Изменяет порядок отображения фотографий автомобиля',
        } as ApiOperationOptions,
        GET_CARS_BY_STATUS: {
            summary: 'Получить автомобили по статусу',
            description:
                'Возвращает список автомобилей с определенным статусом',
        } as ApiOperationOptions,
    },

    PARAMS: {
        CAR_ID: {
            name: 'id',
            description: 'ID автомобиля',
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
        } as ApiParamOptions,
        PHOTO_ID: {
            name: 'photoId',
            description: 'ID фотографии',
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
        } as ApiParamOptions,
        STATUS: {
            name: 'status',
            description: 'Статус автомобиля',
            enum: CarStatus,
            example: CarStatus.WAREHOUSE,
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
            status: 201,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль успешно добавлен в гараж',
                    },
                    car: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            make: { type: 'string' },
                            model: { type: 'string' },
                            year: { type: 'number' },
                            status: { type: 'string' },
                        },
                    },
                },
            },
        } as ApiResponseOptions,
        GET_ALL_CARS: {
            description: 'Список автомобилей успешно получен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    cars: {
                        type: 'array',
                        items: {
                            type: 'object',
                            properties: {
                                id: { type: 'string', format: 'uuid' },
                                make: { type: 'string' },
                                model: { type: 'string' },
                                year: { type: 'number' },
                                status: { type: 'string' },
                                mileageKm: { type: 'number' },
                            },
                        },
                    },
                    total: { type: 'number' },
                },
            },
        } as ApiResponseOptions,
        GET_CAR: {
            description: 'Автомобиль успешно получен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    id: { type: 'string', format: 'uuid' },
                    make: { type: 'string' },
                    model: { type: 'string' },
                    year: { type: 'number' },
                    bodywork: { type: 'string' },
                    fuelType: { type: 'string' },
                    transmission: { type: 'string' },
                    mileageKm: { type: 'number' },
                    status: { type: 'string' },
                },
            },
        } as ApiResponseOptions,
        UPDATE_CAR: {
            description: 'Автомобиль успешно обновлен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль успешно обновлен',
                    },
                    car: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            make: { type: 'string' },
                            model: { type: 'string' },
                            year: { type: 'number' },
                        },
                    },
                },
            },
        } as ApiResponseOptions,
        DELETE_CAR: {
            description: 'Автомобиль успешно удален',
            status: 200,
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
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Статус автомобиля успешно изменен',
                    },
                    car: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            status: { type: 'string' },
                            price: { type: 'number', nullable: true },
                        },
                    },
                },
            },
        } as ApiResponseOptions,
        ADD_CAR_PHOTOS: {
            description: 'Фото успешно добавлены',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Фото успешно загружены',
                    },
                    car: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            photos: {
                                type: 'array',
                                items: {
                                    type: 'object',
                                    properties: {
                                        id: { type: 'string', format: 'uuid' },
                                        url: { type: 'string' },
                                        displayOrder: { type: 'number' },
                                    },
                                },
                            },
                        },
                    },
                },
            },
        } as ApiResponseOptions,
        REMOVE_CAR_PHOTO: {
            description: 'Фото успешно удалено',
            status: 200,
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
            status: 200,
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

        NOT_FOUND: {
            description: 'Автомобиль не найден',
            status: 404,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Автомобиль не найден',
                    },
                    error: { type: 'string', example: 'Not Found' },
                    statusCode: { type: 'number', example: 404 },
                },
            },
        } as ApiResponseOptions,
        PHOTO_NOT_FOUND: {
            description: 'Фото не найдено',
            status: 404,
            schema: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'Фото не найдено' },
                    error: { type: 'string', example: 'Not Found' },
                    statusCode: { type: 'number', example: 404 },
                },
            },
        } as ApiResponseOptions,
        BAD_REQUEST: {
            description: 'Неверные данные',
            status: 400,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Неверные данные для создания автомобиля',
                    },
                    error: { type: 'string', example: 'Bad Request' },
                    statusCode: { type: 'number', example: 400 },
                },
            },
        } as ApiResponseOptions,
        INVALID_STATUS_TRANSITION: {
            description: 'Недопустимый переход между статусами',
            status: 400,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Недопустимый переход между статусами',
                    },
                    error: { type: 'string', example: 'Bad Request' },
                    statusCode: { type: 'number', example: 400 },
                },
            },
        } as ApiResponseOptions,
        NO_PHOTOS: {
            description: 'Не загружено ни одного фото',
            status: 400,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Не загружено ни одного фото',
                    },
                    error: { type: 'string', example: 'Bad Request' },
                    statusCode: { type: 'number', example: 400 },
                },
            },
        } as ApiResponseOptions,
        UNAUTHORIZED: {
            description: 'Пользователь не авторизован',
            status: 401,
            schema: {
                type: 'object',
                properties: {
                    message: { type: 'string', example: 'Unauthorized' },
                    statusCode: { type: 'number', example: 401 },
                },
            },
        } as ApiResponseOptions,
    },
} as const;

export const GARAGE_BODIES = {
    CREATE_CAR: {
        description: 'Данные для создания автомобиля',
        type: CreateCarDto,
    } as ApiBodyOptions,

    UPDATE_CAR: {
        description: 'Данные для обновления автомобиля',
        type: UpdateCarDto,
    } as ApiBodyOptions,

    CHANGE_CAR_STATUS: {
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

    ADD_CAR_PHOTOS: {
        schema: {
            type: 'object',
            properties: {
                photos: {
                    type: 'array',
                    description: 'Фото автомобиля (максимум 10 файлов)',
                    items: {
                        type: 'string',
                        format: 'binary',
                    },
                },
            },
            required: ['photos'],
        },
    } as ApiBodyOptions,

    REORDER_PHOTOS: {
        schema: {
            type: 'object',
            properties: {
                photoIds: {
                    type: 'array',
                    description: 'Массив ID фото в новом порядке',
                    items: {
                        type: 'string',
                        example: '123e4567-e89b-12d3-a456-426614174000',
                    },
                    example: ['id1', 'id2', 'id3'],
                },
            },
            required: ['photoIds'],
        },
    } as ApiBodyOptions,
} as const;
