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

    SUBSCRIBE: {
        description: 'Данные для подписки на пользователя',
        schema: {
            type: 'object',
            properties: {
                targetUserId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    description:
                        'ID пользователя, на которого нужно подписаться (UUID)',
                    format: 'uuid',
                },
            },
            required: ['targetUserId'],
        },
    } as ApiBodyOptions,

    UNSUBSCRIBE: {
        description: 'Данные для отписки от пользователя',
        schema: {
            type: 'object',
            properties: {
                targetUserId: {
                    type: 'string',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                    description:
                        'ID пользователя, от которого нужно отписаться (UUID)',
                    format: 'uuid',
                },
            },
            required: ['targetUserId'],
        },
    } as ApiBodyOptions,

    DELETE: {
        description: 'Подтверждение удаления аккаунта',
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
} as const;

export const USERS_API_DOCS = {
    OPERATIONS: {
        GET_ME: {
            summary: 'Получение данных текущего пользователя',
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
                'Возвращает список всех зарегистрированных пользователей',
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

        GET_BLOCKED_USERS: {
            summary: 'Получение заблокированных пользователей',
            description:
                'Возвращает список пользователей, которых заблокировал текущий пользователь',
        } as ApiOperationOptions,

        BLOCK_USER: {
            summary: 'Блокировка пользователя',
            description: 'Добавляет пользователя в черный список',
        } as ApiOperationOptions,

        UNBLOCK_USER: {
            summary: 'Разблокировка пользователя',
            description: 'Удаляет пользователя из черного списка',
        } as ApiOperationOptions,

        GET_PUBLIC_PROFILE: {
            summary: 'Получение публичного профиля по ID',
            description:
                'Возвращает публичную информацию о пользователе по его ID',
        } as ApiOperationOptions,

        GET_MY_PUBLIC_PROFILE: {
            summary: 'Получение публичного профиля текущего пользователя',
            description:
                'Возвращает публичную информацию о текущем пользователе',
        } as ApiOperationOptions,

        GENERATE_PUBLIC_LINK: {
            summary: 'Генерация публичной ссылки',
            description: 'Генерирует уникальную публичную ссылку для профиля',
        } as ApiOperationOptions,

        GET_PUBLIC_PROFILE_BY_SLUG: {
            summary: 'Получение публичного профиля по slug',
            description:
                'Возвращает публичную информацию о пользователе по его nickname или ID',
        } as ApiOperationOptions,

        DELETE_ME: {
            summary: 'Удаление профиля',
            description:
                'Удаляет профиль пользователя с возможностью восстановления',
        } as ApiOperationOptions,

        DEACTIVATE_ME: {
            summary: 'Деактивация профиля',
            description: 'Временно деактивирует профиль пользователя',
        } as ApiOperationOptions,

        ACTIVATE_ME: {
            summary: 'Активация профиля',
            description: 'Активирует ранее деактивированный профиль',
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
            type: [User],
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
                        example: 'Вы успешно подписались на пользователя',
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
                        example: 'Вы успешно отписались от пользователя',
                    },
                },
            },
        } as ApiResponseOptions,

        GET_SUBSCRIPTIONS: {
            description: 'Список подписок успешно получен',
            type: [Subscription],
        } as ApiResponseOptions,

        GET_FOLLOWERS: {
            description: 'Список подписчиков успешно получен',
            type: [Follower],
        } as ApiResponseOptions,

        GET_BLOCKED_USERS: {
            description: 'Список заблокированных пользователей успешно получен',
            schema: {
                type: 'array',
                items: {
                    type: 'object',
                    properties: {
                        id: {
                            type: 'string',
                            example: '123e4567-e89b-12d3-a456-426614174000',
                            format: 'uuid',
                        },
                        nickname: { type: 'string', example: 'blocked_user' },
                        name: {
                            type: 'string',
                            example: 'Заблокированный пользователь',
                        },
                    },
                },
            },
        } as ApiResponseOptions,

        BLOCK_USER: {
            description: 'Пользователь успешно заблокирован',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Пользователь успешно заблокирован',
                    },
                },
            },
        } as ApiResponseOptions,

        UNBLOCK_USER: {
            description: 'Пользователь успешно разблокирован',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Пользователь успешно разблокирован',
                    },
                },
            },
        } as ApiResponseOptions,

        GET_PUBLIC_PROFILE: {
            description: 'Публичный профиль успешно получен',
            type: User,
        } as ApiResponseOptions,

        GET_MY_PUBLIC_PROFILE: {
            description:
                'Публичный профиль текущего пользователя успешно получен',
            type: User,
        } as ApiResponseOptions,

        GENERATE_PUBLIC_LINK: {
            description: 'Публичная ссылка успешно сгенерирована',
            schema: {
                type: 'object',
                properties: {
                    publicUrl: {
                        type: 'string',
                        example: 'https://yourapp.com/u/john_doe',
                    },
                    message: {
                        type: 'string',
                        example: 'Публичная ссылка успешно сгенерирована',
                    },
                },
            },
        } as ApiResponseOptions,

        DELETE_ME: {
            description: 'Профиль успешно удален',
            schema: {
                type: 'object',
                properties: {
                    message: {
                        type: 'string',
                        example: 'Профиль успешно удален',
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

        BAD_REQUEST_BLOCK: {
            status: 400,
            description: 'Пользователь не найден или уже заблокирован',
        } as ApiResponseOptions,

        BAD_REQUEST_UNBLOCK: {
            status: 400,
            description: 'Пользователь не найден или не заблокирован',
        } as ApiResponseOptions,

        BAD_REQUEST_DELETE: {
            status: 400,
            description: 'Неверное подтверждение удаления',
        } as ApiResponseOptions,
    },

    PARAMS: {
        USER_ID: {
            name: 'userId',
            description: 'ID пользователя (UUID)',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,

        ID: {
            name: 'id',
            description: 'ID пользователя (UUID)',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,

        SLUG: {
            name: 'slug',
            description: 'Nickname или ID пользователя',
            type: String,
            example: 'john_doe',
        } as ApiParamOptions,

        TARGET_USER_ID: {
            name: 'userId',
            description: 'ID пользователя для блокировки/разблокировки (UUID)',
            type: String,
            example: '123e4567-e89b-12d3-a456-426614174000',
            format: 'uuid',
        } as ApiParamOptions,
    },
} as const;
