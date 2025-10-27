import { registerAs } from '@nestjs/config';

export default registerAs('auth', () => ({
    accessSecret: process.env.JWT_ACCESS_SECRET as string,
    accessExpiresIn: process.env.JWT_ACCESS_EXPIRES_IN as string,
    refreshSecret: process.env.JWT_REFRESH_SECRET as string,
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN as string,
    websocketExpiresIn: process.env.JWT_WEBSOCKET_EXPIRES_IN as string,
}));
