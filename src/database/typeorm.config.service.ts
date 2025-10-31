import { Inject, Injectable } from '@nestjs/common';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';

import { database } from '../config';
import * as entities from './entities';

@Injectable()
class TypeormConfigService implements TypeOrmOptionsFactory {
    constructor(
        @Inject(database.KEY)
        private dbConfig: ConfigType<typeof database>,
    ) {}

    createTypeOrmOptions(): TypeOrmModuleOptions {
        return {
            type: 'postgres',
            url: this.dbConfig.url,
            synchronize: true,
            migrationsRun: false,
            migrationsTableName: 'migrations',
            entities: [
                __dirname + '/../entities/*.js',
                ...Object.values(entities),
            ],
            migrations: [__dirname + '/../migration/*.js'],
            subscribers: [__dirname + '/../subscriber/*.js'],
            schema: this.dbConfig.schema,
        };
    }
}

export default TypeormConfigService;
