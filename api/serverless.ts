import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import type { NestExpressApplication } from '@nestjs/platform-express';

let app: NestExpressApplication;

async function bootstrap() {
    if (!app) {
        app = await NestFactory.create<NestExpressApplication>(AppModule, {
            logger: ['error', 'warn', 'log'],
        });

        // Global validation pipe
        app.useGlobalPipes(
            new ValidationPipe({ transform: true, whitelist: true }),
        );

        // Swagger setup
        const config = new DocumentBuilder()
            .setTitle('Автосалоны API')
            .setDescription('Cars Backend API')
            .setVersion('0.1')
            .addBearerAuth(
                {
                    type: 'http',
                    scheme: 'bearer',
                    bearerFormat: 'JWT',
                    name: 'JWT',
                    description: 'Enter JWT token',
                    in: 'header',
                },
                'JWT-auth',
            )
            .build();

        const documentFactory = () =>
            SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, documentFactory);

        // Enable CORS
        app.enableCors({
            origin: true,
            credentials: true,
        });

        await app.init();
    }

    return app;
}

// Export the handler for Vercel
export default async (req: any, res: any) => {
    const application = await bootstrap();
    const expressApp = application.getHttpAdapter().getInstance();
    return expressApp(req, res);
};
