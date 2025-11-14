import {
    ApiOperationOptions,
    ApiParamOptions,
    ApiResponseOptions,
    ApiBodyOptions,
} from '@nestjs/swagger';
import { CreateServiceRecordDto, UpdateServiceRecordDto } from '../dto';

const COMMON_RESPONSES: {
    UNAUTHORIZED: ApiResponseOptions;
    NOT_FOUND: ApiResponseOptions;
    BAD_REQUEST: ApiResponseOptions;
} = {
    UNAUTHORIZED: {
        description:
            'Не авторизован. Отсутствует или недействителен JWT токен.',
        status: 401,
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 401 },
                message: { type: 'string', example: 'Unauthorized' },
                error: { type: 'string', example: 'Unauthorized' },
            },
        },
    },
    NOT_FOUND: {
        description: 'Не найдено. Запись, автомобиль или ресурс не существует.',
        status: 404,
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 404 },
                message: {
                    type: 'string',
                    example: 'Запись обслуживания или автомобиль не найдены',
                },
                error: { type: 'string', example: 'Not Found' },
            },
        },
    },
    BAD_REQUEST: {
        description: 'Неверный запрос. Неверный формат данных (UUID, DTO).',
        status: 400,
        schema: {
            type: 'object',
            properties: {
                statusCode: { type: 'number', example: 400 },
                message: {
                    oneOf: [
                        { type: 'string', example: 'Неверный формат UUID' },
                        {
                            type: 'array',
                            items: { type: 'string' },
                            example: [
                                'serviceDate must be a valid ISO 8601 date string',
                            ],
                        },
                    ],
                },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    },
};

export const SERVICE_RECORDS_API_DOCS: {
    OPERATIONS: { [key: string]: ApiOperationOptions };
    PARAMS: { [key: string]: ApiParamOptions };
    BODIES: { [key: string]: ApiBodyOptions };
    RESPONSES: { [key: string]: ApiResponseOptions };
} = {
    OPERATIONS: {
        CREATE_SERVICE_RECORD: {
            summary: 'Добавить запись обслуживания',
            description: 'Добавляет новую запись обслуживания для автомобиля',
        },
        GET_ALL_SERVICE_RECORDS: {
            summary: 'Получить все записи обслуживания по автомобилю',
            description:
                'Возвращает список всех записей обслуживания для автомобиля с общим количеством',
        },
        GET_SERVICE_RECORD: {
            summary: 'Получить запись обслуживания по ID',
            description: 'Возвращает информацию о записи обслуживания по её ID',
        },
        UPDATE_SERVICE_RECORD: {
            summary: 'Обновить запись обслуживания',
            description: 'Обновляет запись обслуживания для автомобиля',
        },
        DELETE_SERVICE_RECORD: {
            summary: 'Удалить запись обслуживания',
            description: 'Удаляет запись обслуживания для автомобиля',
        },
    },

    PARAMS: {
        CAR_ID: {
            name: 'carId',
            description: 'ID автомобиля',
            type: 'string',
            format: 'uuid',
            example: 'a1b2c3d4-e5f6-7890-1234-567890abcdef',
        },
        RECORD_ID: {
            name: 'recordId',
            description: 'ID записи обслуживания',
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
        },
    },

    BODIES: {
        CREATE_SERVICE_RECORD: {
            description: 'Данные для создания новой записи обслуживания',
            type: CreateServiceRecordDto,
        },
        UPDATE_SERVICE_RECORD: {
            description: 'Данные для обновления записи обслуживания',
            type: UpdateServiceRecordDto,
        },
    },

    RESPONSES: {
        ...COMMON_RESPONSES,

        CREATE_SERVICE_RECORD: {
            description: 'Запись обслуживания успешно добавлена',
            status: 201,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Запись обслуживания успешно добавлена',
                    },
                    record: {
                        $ref: '#/components/schemas/ServiceRecord',
                    },
                },
            },
        },

        GET_ALL_SERVICE_RECORDS: {
            description: 'Список записей обслуживания успешно получен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    records: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/ServiceRecord' },
                    },
                    total: {
                        type: 'number',
                        example: 5,
                    },
                },
            },
        },

        GET_SERVICE_RECORD: {
            description: 'Запись обслуживания успешно получена',
            status: 200,
            schema: { $ref: '#/components/schemas/ServiceRecord' },
        },

        UPDATE_SERVICE_RECORD: {
            description: 'Запись обслуживания успешно обновлена',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Запись обслуживания успешно обновлена',
                    },
                    record: {
                        $ref: '#/components/schemas/ServiceRecord',
                    },
                },
            },
        },

        DELETE_SERVICE_RECORD: {
            description: 'Запись обслуживания успешно удалена',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Запись обслуживания успешно удалена',
                    },
                },
            },
        },
    },
};
