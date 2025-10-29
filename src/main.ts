import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import * as fs from 'fs';

const getSSLEnv = () => {
    const sslKeyPath = process.env['SSL_KEY_PATH'];
    const sslCertPath = process.env['SSL_CERT_PATH'];

    return {
        sslKeyPath,
        sslCertPath,
    };
};

async function bootstrap() {
    const { sslKeyPath, sslCertPath } = getSSLEnv();

    const httpsOptions =
        sslKeyPath && sslCertPath
            ? {
                  httpsOptions: {
                      key: fs.readFileSync(sslKeyPath),
                      cert: fs.readFileSync(sslCertPath),
                  },
              }
            : {};

    const app: INestApplication = await NestFactory.create(
        AppModule,
        httpsOptions,
    );

    app.useGlobalPipes(new ValidationPipe());

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

    await app.listen(process.env.PORT ?? 3000);
}

bootstrap();
