import {
    ApiOperationOptions,
    ApiParamOptions,
    ApiResponseOptions,
    ApiBodyOptions,
} from '@nestjs/swagger';
import { CreateCarExpenseDto, UpdateCarExpenseDto } from '../dto';

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
                    example: 'Расход или автомобиль не найдены',
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
                                'amount must be a number conforming to the specified constraints',
                            ],
                        },
                    ],
                },
                error: { type: 'string', example: 'Bad Request' },
            },
        },
    },
};

export const CAR_EXPENSE_API_DOCS: {
    OPERATIONS: { [key: string]: ApiOperationOptions };
    PARAMS: { [key: string]: ApiParamOptions };
    BODIES: { [key: string]: ApiBodyOptions };
    RESPONSES: { [key: string]: ApiResponseOptions };
} = {
    OPERATIONS: {
        CREATE_EXPENSE: {
            summary: 'Добавить расход по автомобилю',
            description: 'Добавляет новый расход по автомобилю',
        },
        GET_ALL_EXPENSES: {
            summary: 'Получить все расходы по автомобилю',
            description:
                'Возвращает все расходы по конкретному автомобилю с общим количеством',
        },
        GET_EXPENSE: {
            summary: 'Получить расход по ID',
            description: 'Возвращает подробности расхода по его ID',
        },
        UPDATE_EXPENSE: {
            summary: 'Обновить расход по автомобилю',
            description: 'Обновляет расход по автомобилю',
        },
        DELETE_EXPENSE: {
            summary: 'Удалить расход по автомобилю',
            description: 'Удаляет расход по автомобилю',
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
        EXPENSE_ID: {
            name: 'expenseId',
            description: 'ID расхода',
            type: 'string',
            format: 'uuid',
            example: '123e4567-e89b-12d3-a456-426614174000',
        },
    },

    BODIES: {
        CREATE_EXPENSE: {
            description: 'Данные для создания нового расхода',
            type: CreateCarExpenseDto,
        },
        UPDATE_EXPENSE: {
            description: 'Данные для обновления расхода',
            type: UpdateCarExpenseDto,
        },
    },

    RESPONSES: {
        ...COMMON_RESPONSES,

        CREATE_EXPENSE: {
            description: 'Расход по автомобилю успешно добавлен',
            status: 201,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Расход успешно добавлен',
                    },
                    expense: {
                        $ref: '#/components/schemas/CarExpense',
                    },
                },
            },
        },

        GET_ALL_EXPENSES: {
            description: 'Список расходов успешно получен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    expenses: {
                        type: 'array',
                        items: { $ref: '#/components/schemas/CarExpense' },
                    },
                    total: {
                        type: 'number',
                        example: 3,
                    },
                },
            },
        },

        GET_EXPENSE: {
            description: 'Расход успешно получен',
            status: 200,
            schema: { $ref: '#/components/schemas/CarExpense' },
        },

        UPDATE_EXPENSE: {
            description: 'Расход успешно обновлен',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Расход успешно обновлен',
                    },
                    expense: {
                        $ref: '#/components/schemas/CarExpense',
                    },
                },
            },
        },

        DELETE_EXPENSE: {
            description: 'Расход успешно удален',
            status: 200,
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Расход успешно удален',
                    },
                },
            },
        },
    },
};
