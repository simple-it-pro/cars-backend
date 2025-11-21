import {
    ApiOperationOptions,
    ApiResponseOptions,
    ApiQueryOptions,
} from '@nestjs/swagger';
import { FeedTypeEnum } from './enums';
import { CursorDto } from '../shared/pagination/cursor';
import { PostResponseDto } from '../posts/dto/responses';

export const FEED_API_DOCS = {
    OPERATIONS: {
        GET_FEED: {
            summary: 'Получить ленту постов',
            description:
                'Возвращает ленту постов с пагинацией. Можно фильтровать по типу: все посты или только от подписок',
        } as ApiOperationOptions,
    },

    RESPONSES: {
        GET_FEED: {
            description: 'Лента постов успешно получена',
            type: CursorDto<PostResponseDto>,
        } as ApiResponseOptions,

        UNAUTHORIZED: {
            status: 401,
            description: 'Пользователь не авторизован',
        } as ApiResponseOptions,
    },

    QUERIES: {
        FEED_TYPE: {
            name: 'feedType',
            enum: FeedTypeEnum,
            required: false,
            description:
                'Тип ленты: all - все посты, subscriptions - только от подписок',
            example: FeedTypeEnum.ALL,
        } as ApiQueryOptions,
    },
} as const;
