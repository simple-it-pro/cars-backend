import { ApiBodyOptions } from '@nestjs/swagger';

export const USERS_BODIES = {
    UPDATE_ME: {
        schema: {
            type: 'object',
            properties: {
                name: { type: 'string', example: 'John Doe' },
                email: { type: 'string', example: 'john.doe@example.com' },
                nickname: { type: 'string', example: 'JohnDoe' },
                birthdate: {
                    type: 'string',
                    example: '2000-09-01T08:57:59.589Z',
                },
                phone: { type: 'string', example: '+79000000000' },
                city: { type: 'string', example: 'Moscow' },
                about: { type: 'string', example: 'Hello, I am John Doe' },
            },
        },
    } as ApiBodyOptions,
    UPDATE_AVATAR: {
        schema: {
            type: 'object',
            properties: {
                image: { type: 'string', format: 'binary' },
            },
        },
    } as ApiBodyOptions,
} as const;
