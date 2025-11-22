import { registerAs } from '@nestjs/config';

export default registerAs('node', () => ({
    port: process.env.PORT,
}));
