import { registerAs } from '@nestjs/config';

export default registerAs('database', () => ({
    url: process.env.DB_URL as string,
    schema: process.env.DB_SCHEMA as string,
}));
