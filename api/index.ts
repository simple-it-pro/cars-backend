import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

let cachedApp: any;

async function bootstrap() {
    if (!cachedApp) {
        const app = await NestFactory.create(AppModule);

        app.useGlobalPipes(
            new ValidationPipe({ transform: true, whitelist: true }),
        );

        app.enableCors();

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

        await app.init();
        cachedApp = app;
    }
    return cachedApp;
}

export default async (req: any, res: any) => {
    const app = await bootstrap();
    const server = app.getHttpAdapter().getInstance();
    return server(req, res);
};
