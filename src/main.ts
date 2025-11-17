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

    app.useGlobalPipes(
        new ValidationPipe({ transform: true, whitelist: true }),
    );

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
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document, {
        customCssUrl: 'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui.css',
        customJs: [
            'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-bundle.js',
            'https://cdn.jsdelivr.net/npm/swagger-ui-dist@5.11.0/swagger-ui-standalone-preset.js',
        ],
        customfavIcon: 'data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><text y="0.9em" font-size="90">🚗</text></svg>',
    });

    await app.listen(process.env.PORT ?? 3000);
}

void bootstrap();
