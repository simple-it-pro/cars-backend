import {
    ApiOperationOptions,
    ApiParamOptions,
    ApiResponseOptions,
    ApiBodyOptions,
} from '@nestjs/swagger';

const COMMON_RESPONSES = {
    UNAUTHORIZED: {
        description:
            'Не авторизован. Отсутствует или недействителен JWT токен.',
        status: 401,
    } as ApiResponseOptions,
    NOT_FOUND: {
        description: 'Не найдено. Запись, автомобиль или ресурс не существует.',
        status: 404,
    } as ApiResponseOptions,
    BAD_REQUEST: {
        description: 'Неверный запрос. Неверный формат данных (UUID, DTO).',
        status: 400,
    } as ApiResponseOptions,
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
            description: 'Возвращает все расходы по конкретному автомобилю',
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
        },
        UPDATE_EXPENSE: {
            description: 'Данные для обновления расхода',
        },
    },

    RESPONSES: {
        ...COMMON_RESPONSES,

        CREATE_EXPENSE: {
            description: 'Расход по автомобилю успешно добавлен',
            status: 201,
            schema: {
                properties: {
                    message: {
                        type: 'string',
                        example: 'Расход успешно добавлен',
                    },
                    expense: {
                        type: 'object',
                        properties: {
                            id: { type: 'string', format: 'uuid' },
                            type: { type: 'string' },
                            amount: { type: 'number' },
                            date: { type: 'string', format: 'date-time' },
                        },
                    },
                },
            },
        },
        GET_ALL_EXPENSES: {
            description: 'Список расходов успешно получен',
            status: 200,
            schema: {
                type: 'array',
                items: { $ref: '#/components/schemas/CarExpense' },
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
            schema: { $ref: '#/components/schemas/CarExpense' },
        },
        DELETE_EXPENSE: {
            description: 'Расход успешно удален',
            status: 200,
            schema: {
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
