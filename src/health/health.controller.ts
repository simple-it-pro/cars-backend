import { Controller, Get } from '@nestjs/common';

@Controller()
export class HealthController {
    @Get()
    getRoot() {
        return {
            status: 'ok',
            message: 'Cars Backend API is running',
            timestamp: new Date().toISOString(),
            endpoints: {
                api: '/api',
                admin: '/admin',
                swagger: '/api',
            },
        };
    }

    @Get('health')
    getHealth() {
        return {
            status: 'healthy',
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        };
    }

    @Get('ping')
    getPing() {
        return {
            pong: true,
            timestamp: new Date().toISOString(),
        };
    }
}
