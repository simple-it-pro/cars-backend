import {
    ApiBodyOptions,
    ApiOperationOptions,
    ApiResponseOptions,
    ApiParamOptions,
} from '@nestjs/swagger';
import { Follower, Subscription, User } from '../database/entities';

export const USERS_BODIES = {
    UPDATE_ME: {
        description: 'Данные для обновления профиля пользователя',
        schema: {
            type: 'object',
            properties: {
                name: {
                    type: 'string',
                    example: 'John Doe',
                    description: 'Полное имя пользователя',
                    maxLength: 255,
                    nullable: true,
                },
                email: {
                    type: 'string',
                    example: 'john.doe@example.com',
                    description: 'Email пользователя',
                    format: 'email',
                    maxLength: 255,
                    nullable: true,
                },
                nickname: {
                    type: 'string',
                    example: 'JohnDoe',
                    description: 'Уникальный никнейм пользователя',
                    maxLength: 30,
                    nullable: true,
                },
                birthdate: {
                    type: 'string',
                    example: '2000-09-01T08:57:59.589Z',
                    description: 'Дата рождения пользователя',
                    format: 'date-time',
                    nullable: true,
                },
                phone: {
                    type: 'string',
                    example: '+79000000000',
                    description: 'Номер телефона пользователя',
                    maxLength: 20,
                    nullable: true,
                },
                city: {
                    type: 'string',
                    example: 'Moscow',
                    description: 'Город пользователя',
                    nullable: true,
                },
                about: {
                    type: 'string',
                    example: 'Hello, I am John Doe',
                    description: 'Информация о пользователе',
                    nullable: true,
                },
            },
        },
    } as ApiBodyOptions,

    UPDATE_AVATAR: {
        description: 'Файл аватара для загрузки',
        schema: {
            type: 'object',
            properties: {
                image: {
                    type: 'string',
                    format: 'binary',
                    description:
                        'Изображение для аватара (JPG, PNG, GIF, WebP)',
                },
            },
            required: ['image'],
        },
    } as ApiBodyOptions,
} as const;

export const USERS_API_DOCS = {
    OPERATIONS: {
        GET_ME: {
            summary: 'Получение данных авторизованного пользователя',
            description:
                'Возвращает полную информацию о текущем авторизованном пользователе',
        } as ApiOperationOptions,
        UPDATE_ME: {
            summary: 'Обновление профиля пользователя',
            description:
                'Позволяет пользователю обновить информацию о своем профиле',
        } as ApiOperationOptions,
        GET_ALL: {
            summary: 'Получение списка всех пользователей',
            description:
                'Возвращает список всех зарегистрированных пользователей (без чувствительных данных)',
        } as ApiOperationOptions,
        UPDATE_AVATAR: {
            summary: 'Обновление аватара пользователя',
            description: 'Позволяет пользователю загрузить новый аватар',
        } as ApiOperationOptions,
        SUBSCRIBE: {
            summary: 'Подписка на пользователя',
            description:
                'Позволяет текущему пользователю подписаться на другого пользователя',
        } as ApiOperationOptions,
        UNSUBSCRIBE: {
            summary: 'Отписка от пользователя',
            description:
                'Позволяет текущему пользователю отписаться от другого пользователя',
        } as ApiOperationOptions,
        GET_SUBSCRIPTIONS: {
            summary: 'Получение подписок пользователя',
            description:
                'Возвращает список пользователей, на которых подписан указанный пользователь',
        } as ApiOperationOptions,
        GET_FOLLOWERS: {
            summary: 'Получение подписчиков пользователя',
            description:
                'Возвращает список пользователей, которые подписаны на указанного пользователя',
        } as ApiOperationOptions,
        GET_PUBLIC_PROFILE: {
            summary: 'Получение публичного профиля пользователя',
            description:
                'Возвращает публичную информацию о пользователе (без email и других приватных данных)',
        } as ApiOperationOptions,
        DELETE_ME: {
            summary: 'Удаление профиля (soft delete)',
            description:
                'Удаляет профиль пользователя с возможностью восстановления. Требует подтверждения.',
        } as ApiOperationOptions,
        DEACTIVATE_ME: {
            summary: 'Деактивация профиля',
            description:
                'Временно деактивирует профиль пользователя. Пользователь не будет отображаться в поиске, но данные сохраняются.',
        } as ApiOperationOptions,
        ACTIVATE_ME: {
            summary: 'Активация профиля',
            description:
                'Активирует ранее деактивированный профиль пользователя',
        } as ApiOperationOptions,
    },

    RESPONSES: {
        GET_ME: {
            description: 'Данные пользователя успешно получены',
            type: User,
        } as ApiResponseOptions,
        UPDATE_ME: {
            description: 'Профиль успешно обновлен',
            type: User,
        } as ApiResponseOptions,
        GET_ALL: {
            description: 'Список пользователей успешно получен',
            type: User,
            isArray: true,
        } as ApiResponseOptions,
        UPDATE_AVATAR: {
            description: 'Аватар успешно обновлен',
            type: User,
        } as ApiResponseOptions,
        SUBSCRIBE: {
            description: 'Подписка успешно оформлена',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Вы успешно подписались на пользователя.',
                    },
                },
            },
        } as ApiResponseOptions,
        UNSUBSCRIBE: {
            description: 'Отписка выполнена успешно',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Вы успешно отписались от пользователя.',
                    },
                },
            },
        } as ApiResponseOptions,
        GET_SUBSCRIPTIONS: {
            description: 'Список подписок успешно получен',
            type: Subscription,
            isArray: true,
        } as ApiResponseOptions,
        GET_FOLLOWERS: {
            description: 'Список подписчиков успешно получен',
            type: Follower,
            isArray: true,
        } as ApiResponseOptions,
        GET_PUBLIC_PROFILE: {
            description: 'Публичный профиль успешно получен',
            type: User,
        } as ApiResponseOptions,
        DELETE_ME: {
            description: 'Профиль успешно удален',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Профиль успешно удален.',
                    },
                },
            },
        } as ApiResponseOptions,
        DEACTIVATE_ME: {
            description: 'Профиль успешно деактивирован',
            type: User,
        } as ApiResponseOptions,
        ACTIVATE_ME: {
            description: 'Профиль успешно активирован',
            type: User,
        } as ApiResponseOptions,

        UNAUTHORIZED: {
            status: 401,
            description: 'Пользователь не авторизован',
        } as ApiResponseOptions,
        NOT_FOUND: {
            status: 404,
            description: 'Пользователь не найден',
        } as ApiResponseOptions,
        BAD_REQUEST_UPDATE: {
            status: 400,
            description:
                'Неверные данные или дублирование email/nickname/phone',
        } as ApiResponseOptions,
        BAD_REQUEST_AVATAR: {
            status: 400,
            description: 'Файл не предоставлен или имеет недопустимый формат',
        } as ApiResponseOptions,
        BAD_REQUEST_SUBSCRIBE: {
            status: 400,
            description: 'Пользователь не найден или уже подписан',
        } as ApiResponseOptions,
        BAD_REQUEST_UNSUBSCRIBE: {
            status: 400,
            description: 'Пользователь не найден или не подписан',
        } as ApiResponseOptions,
        BAD_REQUEST_DELETE: {
            status: 400,
            description: 'Неверное подтверждение удаления',
        } as ApiResponseOptions,
    },

    BODIES: {
        SUBSCRIBE: {
            schema: {
                type: 'object',
                properties: {
                    targetUserId: {
                        type: 'number',
                        example: 2,
                        description:
                            'ID пользователя, на которого нужно подписаться',
                    },
                },
                required: ['targetUserId'],
            },
        } as ApiBodyOptions,
        UNSUBSCRIBE: {
            schema: {
                type: 'object',
                properties: {
                    targetUserId: {
                        type: 'number',
                        example: 2,
                        description:
                            'ID пользователя, от которого нужно отписаться',
                    },
                },
                required: ['targetUserId'],
            },
        } as ApiBodyOptions,
        DELETE: {
            schema: {
                type: 'object',
                properties: {
                    confirmation: {
                        type: 'string',
                        example: 'DELETE_MY_ACCOUNT',
                        description: 'Строка подтверждения удаления аккаунта',
                    },
                },
                required: ['confirmation'],
            },
        } as ApiBodyOptions,
    },

    PARAMS: {
        USER_ID: {
            name: 'userId',
            type: Number,
            description: 'ID пользователя',
            example: 1,
        } as ApiParamOptions,
        ID: {
            name: 'id',
            type: Number,
            description: 'ID пользователя',
            example: 1,
        } as ApiParamOptions,
    },
} as const;
