import {
    ApiOperationOptions,
    ApiResponseOptions,
    ApiParamOptions,
    ApiQueryOptions,
} from '@nestjs/swagger';
import { Notification } from '../database/entities';
import { NotificationType } from '../common/types';

export const NOTIFICATIONS_API_DOCS = {
    OPERATIONS: {
        GET_ALL: {
            summary: 'Получение всех уведомлений пользователя',
            description:
                'Возвращает список всех уведомлений пользователя с возможностью фильтрации по типу',
        } as ApiOperationOptions,
        GET_UNREAD: {
            summary: 'Получение непрочитанных уведомлений пользователя',
            description:
                'Возвращает список всех непрочитанных уведомлений пользователя с возможностью фильтрации по типу',
        } as ApiOperationOptions,
        GET_UNREAD_COUNT: {
            summary: 'Получение количества непрочитанных уведомлений',
            description:
                'Возвращает количество непрочитанных уведомлений для текущего пользователя',
        } as ApiOperationOptions,
        MARK_AS_READ: {
            summary: 'Отметить уведомление как прочитанное',
            description: 'Отмечает конкретное уведомление как прочитанное',
        } as ApiOperationOptions,
        MARK_ALL_AS_READ: {
            summary: 'Отметить все уведомления как прочитанные',
            description:
                'Отмечает все уведомления пользователя как прочитанные',
        } as ApiOperationOptions,
        DELETE: {
            summary: 'Удаление уведомления',
            description: 'Удаляет конкретное уведомление',
        } as ApiOperationOptions,
    },

    RESPONSES: {
        GET_ALL: {
            description: 'Список уведомлений успешно получен',
            type: Notification,
            isArray: true,
        } as ApiResponseOptions,
        GET_UNREAD: {
            description: 'Список уведомлений успешно получен',
            type: Notification,
            isArray: true,
        } as ApiResponseOptions,
        GET_UNREAD_COUNT: {
            description:
                'Количество непрочитанных уведомлений успешно получено',
            schema: {
                type: 'object',
                properties: {
                    count: {
                        type: 'number',
                        example: 5,
                    },
                },
            },
        } as ApiResponseOptions,
        MARK_AS_READ: {
            description: 'Уведомление успешно отмечено как прочитанное',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Уведомление отмечено как прочитанное',
                    },
                },
            },
        } as ApiResponseOptions,
        MARK_ALL_AS_READ: {
            description: 'Все уведомления успешно отмечены как прочитанные',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Все уведомления отмечены как прочитанные',
                    },
                    affected: {
                        type: 'number',
                        example: 10,
                    },
                },
            },
        } as ApiResponseOptions,
        DELETE: {
            description: 'Уведомление успешно удалено',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Уведомление успешно удалено',
                    },
                },
            },
        } as ApiResponseOptions,

        UNAUTHORIZED: {
            status: 401,
            description: 'Пользователь не авторизован',
        } as ApiResponseOptions,
        NOT_FOUND: {
            status: 404,
            description: 'Уведомление не найдено',
        } as ApiResponseOptions,
    },

    PARAMS: {
        NOTIFICATION_ID: {
            name: 'id',
            type: String,
            description: 'ID уведомления (UUID)',
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,
    },

    QUERIES: {
        FILTER_TYPE: {
            name: 'type',
            required: false,
            description: 'Фильтр по типу уведомления',
            enum: NotificationType,
            example: 'like',
        } as ApiQueryOptions,
    },
} as const;
