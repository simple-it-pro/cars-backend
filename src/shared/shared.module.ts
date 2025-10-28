import { Global, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import * as config from '../config';
import TypeormConfigService from '../database/typeorm.config.service';
import validationSchema from './validation-schema';

@Global()
@Module({
    imports: [
        ConfigModule.forRoot({
            envFilePath: ['./.env', '.example.env'],
            load: [...Object.values(config)],
            isGlobal: true,
            validationSchema,
            validationOptions: {
                abortEarly: true,
            },
        }),
        TypeOrmModule.forRootAsync({
            useClass: TypeormConfigService,
        }),
    ],
    controllers: [],
})
export class SharedModule {}
