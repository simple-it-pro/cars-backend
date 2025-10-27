import { ApiResponseOptions, ApiBodyOptions } from '@nestjs/swagger';

export const CHAT_RESPONSES = {
  PAGINATED_CHATS: {
    status: 200,
    schema: {
      type: 'object',
      properties: {
        chats: { type: 'array', items: { $ref: '#/components/schemas/Chat' } },
        hasMore: { type: 'boolean', example: true },
        nextCursor: {
          type: 'string',
          nullable: true,
          example: '2025-09-14T08:57:59.589Z_9c9a6b7c',
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
          example: '2025-09-14T08:57:59.589Z_9c9a6b7c',
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
      },
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
          description: 'Доп. файлы для загрузки в S3 вместе с пересылкой',
          items: { type: 'string', format: 'binary' },
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

export const API_CONSUMES = {
  MULTIPART_FORM_DATA: 'multipart/form-data',
} as const;
