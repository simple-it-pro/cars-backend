import {
    ApiOperationOptions,
    ApiResponseOptions,
    ApiParamOptions,
} from '@nestjs/swagger';
import { CursorDto } from '../../shared/pagination/cursor';
import { SubscriptionItemDto } from '../dto/responses';

export const SUBSCRIPTIONS_API_DOCS = {
    OPERATIONS: {
        GET_SUBSCRIPTIONS: {
            summary: 'Получить список подписок пользователя',
            description:
                'Возвращает список пользователей, на которых подписан указанный пользователь с пагинацией и поиском',
        } as ApiOperationOptions,

        GET_FOLLOWERS: {
            summary: 'Получить список фолловеров пользователя',
            description:
                'Возвращает список пользователей, которые подписаны на указанного пользователя с пагинацией и поиском',
        } as ApiOperationOptions,

        SUBSCRIBE_USER: {
            summary: 'Подписаться на пользователя',
            description: 'Создает подписку на указанного пользователя',
        } as ApiOperationOptions,

        UNSUBSCRIBE_USER: {
            summary: 'Отписаться от пользователя',
            description: 'Удаляет подписку на указанного пользователя',
        } as ApiOperationOptions,
    },

    RESPONSES: {
        GET_SUBSCRIPTIONS: {
            description: 'Список подписок с пагинацией',
            type: CursorDto<SubscriptionItemDto>,
        } as ApiResponseOptions,

        GET_FOLLOWERS: {
            description: 'Список фолловеров с пагинацией',
            type: CursorDto<SubscriptionItemDto>,
        } as ApiResponseOptions,

        SUBSCRIBE_USER: {
            description: 'Подписка успешно оформлена',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Вы успешно подписались на пользователя',
                    },
                },
            },
        } as ApiResponseOptions,

        UNSUBSCRIBE_USER: {
            description: 'Отписка выполнена успешно',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Вы успешно отписались от пользователя',
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
            description: 'Пользователь не найден',
        } as ApiResponseOptions,
    },

    PARAMS: {
        USER_ID: {
            name: 'userId',
            description:
                'ID пользователя, чьи подписки/фолловеры нужно получить',
            type: String,
            example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
            format: 'uuid',
        } as ApiParamOptions,

        TARGET_USER_ID: {
            name: 'targetUserId',
            description:
                'ID пользователя, на которого нужно подписаться/отписаться',
            type: String,
            example: 'c20ad4d7-6fe9-4759-8a27-a0c99bff6710',
            format: 'uuid',
        } as ApiParamOptions,
    },
} as const;
