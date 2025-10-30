import { ApiBodyOptions } from '@nestjs/swagger';

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
