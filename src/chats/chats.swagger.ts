import { ApiBodyOptions, ApiResponseOptions } from '@nestjs/swagger';

export const CHAT_RESPONSES = {
    PAGINATED_CHATS: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                chats: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Chat' },
                },
                hasMore: { type: 'boolean', example: true },
                nextCursor: {
                    type: 'string',
                    nullable: true,
                    example:
                        '2025-09-14T08:57:59.589Z_123e4567-e89b-12d3-a456-426614174000',
                },
            },
        },
        description: 'Список чатов пользователя с пагинацией-курсором',
    } as ApiResponseOptions,

    PAGINATED_MESSAGES: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                messages: {
                    type: 'array',
                    items: { $ref: '#/components/schemas/Message' },
                },
                hasMore: { type: 'boolean', example: true },
                nextCursor: {
                    type: 'string',
                    nullable: true,
                    example:
                        '2025-09-14T08:57:59.589Z_123e4567-e89b-12d3-a456-426614174000',
                },
            },
        },
        description: 'Сообщения чата с пагинацией-курсором',
    } as ApiResponseOptions,

    UNREAD_COUNT: {
        status: 200,
        schema: {
            type: 'object',
            properties: { unreadCount: { type: 'number', example: 5 } },
        },
        description: 'Количество непрочитанных сообщений',
    } as ApiResponseOptions,

    SUCCESS_RESPONSE: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string' },
            },
        },
    } as ApiResponseOptions,

    MARK_ALL_READ_RESPONSE: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: {
                    type: 'string',
                    example: 'Все чаты отмечены как прочитанные',
                },
            },
        },
        description: 'Все чаты успешно отмечены как прочитанные',
    } as ApiResponseOptions,

    MARK_CHATS_READ_RESPONSE: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: {
                    type: 'string',
                    example: 'Чаты отмечены как прочитанные',
                },
            },
        },
        description: 'Выбранные чаты отмечены как прочитанные',
    } as ApiResponseOptions,

    DELETE_CHATS_RESPONSE: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Чаты удалены успешно' },
            },
        },
        description: 'Чаты успешно удалены',
    } as ApiResponseOptions,

    DELETE_CHAT_RESPONSE: {
        status: 200,
        schema: {
            type: 'object',
            properties: {
                success: { type: 'boolean', example: true },
                message: { type: 'string', example: 'Чат удален успешно' },
            },
        },
        description: 'Чат успешно удален',
    } as ApiResponseOptions,
} as const;

export const MESSAGE_BODIES = {
    SEND_MESSAGE: {
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Текст сообщения',
                    example: 'Привет! Отправляю файл',
                },
                files: {
                    type: 'array',
                    description: 'Файлы',
                    items: { type: 'string', format: 'binary' },
                },
                quotedText: {
                    type: 'string',
                    description: 'Цитируемый текст',
                    example: 'Исходное сообщение',
                },
                replyToMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для ответа',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                forwardFromMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для пересылки',
                    example: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
        },
    } as ApiBodyOptions,

    SEND_VOICE_MESSAGE: {
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Аудиофайл для голосового сообщения',
                },
                content: {
                    type: 'string',
                    description: 'Подпись к голосовому сообщению',
                    example: 'Голосовая заметка',
                },
                quotedText: {
                    type: 'string',
                    description: 'Текст цитаты',
                },
                replyToMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для ответа',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                forwardFromMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для пересылки',
                    example: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
            required: ['file'],
        },
    } as ApiBodyOptions,

    SEND_VIDEO_MESSAGE: {
        schema: {
            type: 'object',
            properties: {
                file: {
                    type: 'string',
                    format: 'binary',
                    description: 'Видеофайл для видео сообщения',
                },
                content: {
                    type: 'string',
                    description: 'Подпись к видео сообщению',
                    example: 'Видео заметка',
                },
                quotedText: {
                    type: 'string',
                    description: 'Текст цитаты',
                },
                replyToMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для ответа',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
                forwardFromMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для пересылки',
                    example: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
            required: ['file'],
        },
    } as ApiBodyOptions,

    REPLY_MESSAGE: {
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Текст ответа',
                    example: 'Ок!',
                },
                files: {
                    type: 'array',
                    description: 'Файлы для загрузки в S3',
                    items: { type: 'string', format: 'binary' },
                },
                quotedText: {
                    type: 'string',
                    description: 'Цитируемый текст',
                },
                forwardFromMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для пересылки',
                    example: '123e4567-e89b-12d3-a456-426614174001',
                },
            },
        },
        examples: {
            replyText: { summary: 'Ответ текстом', value: { content: 'Ок!' } },
            replyWithFiles: {
                summary: 'Ответ с файлами',
                value: { content: 'Лови файлы' },
            },
        },
    } as ApiBodyOptions,

    FORWARD_MESSAGE: {
        schema: {
            type: 'object',
            properties: {
                content: {
                    type: 'string',
                    description: 'Комментарий к пересылаемому сообщению',
                    example: 'Смотри',
                },
                files: {
                    type: 'array',
                    description:
                        'Доп. файлы для загрузки в S3 вместе с пересылкой',
                    items: { type: 'string', format: 'binary' },
                },
                quotedText: {
                    type: 'string',
                    description: 'Цитируемый текст',
                },
                replyToMessageId: {
                    type: 'string',
                    format: 'uuid',
                    description: 'ID сообщения для ответа',
                    example: '123e4567-e89b-12d3-a456-426614174000',
                },
            },
        },
        examples: {
            forwardPlain: { summary: 'Чистая пересылка', value: {} },
            forwardWithComment: {
                summary: 'Пересылка с комментарием',
                value: { content: 'Смотри' },
            },
            forwardWithFiles: {
                summary: 'Пересылка с файлами',
                value: { content: 'Прикладываю документы' },
            },
        },
    } as ApiBodyOptions,

    CHAT_IDS_BODY: {
        schema: {
            type: 'object',
            properties: {
                chatIds: {
                    type: 'array',
                    description: 'Массив идентификаторов чатов',
                    example: [
                        '123e4567-e89b-12d3-a456-426614174000',
                        '123e4567-e89b-12d3-a456-426614174001',
                    ],
                    items: { type: 'string', format: 'uuid' },
                },
            },
            required: ['chatIds'],
        },
        description: 'Массив ID чатов для операций',
    } as ApiBodyOptions,
} as const;

export const CHAT_QUERIES = {
    FILTER: {
        name: 'filter',
        required: false,
        enum: ['all', 'unread', 'favorite'],
        description: 'Фильтр списка чатов',
    },
    SEARCH: {
        name: 'search',
        required: false,
        type: String,
        description: 'Поиск по названию чата или имени/нику собеседника',
    },
} as const;

export const CHAT_OPERATIONS = {
    MARK_ALL_READ: {
        summary: 'Отметить все чаты как прочитанные',
        description:
            'Отмечает все сообщения во всех чатах пользователя как прочитанные и обнуляет счетчики непрочитанных',
    },
    MARK_CHATS_READ: {
        summary: 'Отметить выбранные чаты как прочитанные',
        description:
            'Отмечает сообщения в указанных чатах как прочитанные и обнуляет счетчики непрочитанных для этих чатов',
    },
    DELETE_CHATS: {
        summary: 'Удалить несколько чатов',
        description:
            'Удаляет пользователя из указанных чатов. Если в чате не остается участников, чат удаляется полностью',
    },
    DELETE_CHAT: {
        summary: 'Удалить чат',
        description:
            'Удаляет пользователя из указанного чата. Если в чате не остается участников, чат удаляется полностью',
    },
} as const;

export const API_CONSUMES = {
    MULTIPART_FORM_DATA: 'multipart/form-data',
} as const;
