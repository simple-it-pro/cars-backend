import { ApiBodyOptions } from '@nestjs/swagger';

export const POST_FILE_PREUPLOAD_BODY = {
    schema: {
        type: 'object',
        properties: {
            file: {
                type: 'string',
                format: 'binary',
            },
        },
    },
} as ApiBodyOptions;
