import {
    ApiBodyOptions,
    ApiOperationOptions,
    ApiResponseOptions,
    ApiParamOptions,
} from '@nestjs/swagger';
import { ReviewCursorDto } from './dto/responses';

export const REVIEWS_BODIES = {
    CREATE_REVIEW: {
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Текст отзыва',
                    example: 'Отличный автомобиль!',
                },
                userId: {
                    type: 'string',
                    description: 'ID пользователя, которому оставляют отзыв',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    format: 'uuid',
                },
                rank: {
                    type: 'number',
                    description: 'Оценка',
                    example: '5',
                },
                images: {
                    type: 'array',
                    description: 'Изображения',
                    items: { type: 'string', format: 'binary' },
                },
            },
        },
    } as ApiBodyOptions,
} as const;

export const REVIEWS_API_DOCS = {
    OPERATIONS: {
        CREATE_REVIEW: {
            summary: 'Создать отзыв',
            description: 'Создает новый отзыв на пользователя',
        } as ApiOperationOptions,

        FIND_ALL: {
            summary: 'Получить все отзывы (с курсорной пагинацией)',
            description:
                'Возвращает список всех отзывов с курсорной пагинацией и фильтрацией',
        } as ApiOperationOptions,

        GET_VERIFIED_REVIEWS: {
            summary:
                'Получить верифицированные отзывы (с курсорной пагинацией)',
            description:
                'Возвращает список верифицированных отзывов с курсорной пагинацией',
        } as ApiOperationOptions,

        GET_USER_RECEIVED_REVIEWS: {
            summary:
                'Получить отзывы, полученные пользователем (с курсорной пагинацией)',
            description:
                'Возвращает список отзывов, полученных указанным пользователем, с курсорной пагинацией',
        } as ApiOperationOptions,

        GET_USER_AUTHORED_REVIEWS: {
            summary:
                'Получить отзывы, написанные пользователем (с курсорной пагинацией)',
            description:
                'Возвращает список отзывов, написанных указанным пользователем, с курсорной пагинацией',
        } as ApiOperationOptions,

        FIND_ONE: {
            summary: 'Получить отзыв по ID',
            description: 'Возвращает отзыв по его идентификатору',
        } as ApiOperationOptions,

        ANSWER_REVIEW: {
            summary: 'Ответить на отзыв',
            description:
                'Добавляет ответ на отзыв от пользователя, которому оставлен отзыв',
        } as ApiOperationOptions,

        VERIFY_REVIEW: {
            summary: 'Верифицировать отзыв (для админа)',
            description: 'Помечает отзыв как верифицированный',
        } as ApiOperationOptions,

        UNVERIFY_REVIEW: {
            summary: 'Снять верификацию с отзыва (для админа)',
            description: 'Снимает верификацию с отзыва',
        } as ApiOperationOptions,
    },

    RESPONSES: {
        CREATE_REVIEW: {
            status: 201,
            description: 'Отзыв создан',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Отзыв успешно создан',
                    },
                    review: {
                        $ref: '#/components/schemas/Review',
                    },
                },
            },
        } as ApiResponseOptions,

        FIND_ALL: {
            description: 'Список отзывов с курсорной пагинацией',
            type: ReviewCursorDto,
        } as ApiResponseOptions,

        GET_VERIFIED_REVIEWS: {
            description:
                'Список верифицированных отзывов с курсорной пагинацией',
            type: ReviewCursorDto,
        } as ApiResponseOptions,

        GET_USER_RECEIVED_REVIEWS: {
            description: 'Список полученных отзывов с курсорной пагинацией',
            type: ReviewCursorDto,
        } as ApiResponseOptions,

        GET_USER_AUTHORED_REVIEWS: {
            description: 'Список написанных отзывов с курсорной пагинацией',
            type: ReviewCursorDto,
        } as ApiResponseOptions,

        FIND_ONE: {
            description: 'Отзыв успешно получен',
            schema: {
                $ref: '#/components/schemas/Review',
            },
        } as ApiResponseOptions,

        ANSWER_REVIEW: {
            description: 'Ответ на отзыв успешно добавлен',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Ответ на отзыв успешно добавлен',
                    },
                    review: {
                        $ref: '#/components/schemas/Review',
                    },
                },
            },
        } as ApiResponseOptions,

        VERIFY_REVIEW: {
            description: 'Отзыв успешно верифицирован',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Отзыв успешно верифицирован',
                    },
                    review: {
                        $ref: '#/components/schemas/Review',
                    },
                },
            },
        } as ApiResponseOptions,

        UNVERIFY_REVIEW: {
            description: 'Верификация с отзыва успешно снята',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Верификация с отзыва успешно снята',
                    },
                    review: {
                        $ref: '#/components/schemas/Review',
                    },
                },
            },
        } as ApiResponseOptions,

        BAD_REQUEST: {
            status: 400,
            description: 'Неверные данные',
        } as ApiResponseOptions,

        UNAUTHORIZED: {
            status: 401,
            description: 'Пользователь не авторизован',
        } as ApiResponseOptions,

        FORBIDDEN: {
            status: 403,
            description: 'Доступ запрещен',
        } as ApiResponseOptions,

        NOT_FOUND: {
            status: 404,
            description: 'Отзыв не найден',
        } as ApiResponseOptions,
    },

    PARAMS: {
        USER_ID: {
            name: 'userId',
            description: 'ID пользователя',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,

        REVIEW_ID: {
            name: 'id',
            description: 'ID отзыва',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,
    },
} as const;
