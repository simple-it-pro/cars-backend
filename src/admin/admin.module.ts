import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import { DataSource } from 'typeorm';
import {
    User,
    Post,
    Review,
    Chat,
    Message,
    FileEntity,
    Notification,
    Follower,
    Hashtag
} from '../database/entities';

// Register the TypeORM adapter
AdminJS.registerAdapter(AdminJSTypeorm);

@Module({
    imports: [
        AdminJSModule.createAdminAsync({
            inject: [DataSource],
            useFactory: (dataSource: DataSource) => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    branding: {
                        companyName: 'Cars Backend Admin',
                        logo: false,
                        softwareBrothers: false,
                    },
                    databases: [dataSource],
                },
            }),
        }),
    ],
})
export class AdminModule {}
