import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { ExpressAdapter } from '@nestjs/platform-express';
import * as express from 'express';

const server = express();
let app: INestApplication;

async function bootstrap() {
    if (!app) {
        const expressApp = new ExpressAdapter(server);
        app = await NestFactory.create(AppModule, expressApp);

        app.useGlobalPipes(
            new ValidationPipe({ transform: true, whitelist: true }),
        );

        // Swagger setup
        const config = new DocumentBuilder()
            .setTitle('Автосалоны')
            .setDescription('API')
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
        const documentFactory = () => SwaggerModule.createDocument(app, config);
        SwaggerModule.setup('api', app, documentFactory);

        // Enable CORS for Vercel
        app.enableCors();

        await app.init();
    }
    return app;
}

export default async (req: any, res: any) => {
    await bootstrap();
    server(req, res);
};
