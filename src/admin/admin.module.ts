import { Module } from '@nestjs/common';
import AdminJS from 'adminjs';
import { AdminModule as AdminJSModule } from '@adminjs/nestjs';
import * as AdminJSTypeorm from '@adminjs/typeorm';
import { Database, Resource } from '@adminjs/typeorm';
import { User } from '../database/entities/user.entity';
import { Post } from '../database/entities/post.entity';
import { Review } from '../database/entities/review.entity';
import { Chat } from '../database/entities/chat.entity';
import { Message } from '../database/entities/message.entity';
import { File } from '../database/entities/file.entity';
import { Notification } from '../database/entities/notification.entity';
import { Follower } from '../database/entities/follower.entity';
import { Hashtag } from '../database/entities/hashtags.entity';

AdminJS.registerAdapter({ Database, Resource });

@Module({
    imports: [
        AdminJSModule.createAdminAsync({
            useFactory: () => ({
                adminJsOptions: {
                    rootPath: '/admin',
                    branding: {
                        companyName: 'Cars Backend Admin',
                        logo: false,
                        softwareBrothers: false,
                    },
                    resources: [
                        {
                            resource: User,
                            options: {
                                navigation: { name: 'Пользователи', icon: 'User' },
                                properties: {
                                    password: { isVisible: false },
                                    createdAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
                                    updatedAt: { isVisible: { list: true, show: true, edit: false, filter: true } },
                                },
                            },
                        },
                        {
                            resource: Post,
                            options: {
                                navigation: { name: 'Контент', icon: 'FileText' },
                                listProperties: ['id', 'text', 'userId', 'createdAt', 'likesCount'],
                            },
                        },
                        {
                            resource: Review,
                            options: {
                                navigation: { name: 'Контент', icon: 'Star' },
                                listProperties: ['id', 'rating', 'comment', 'userId', 'createdAt'],
                            },
                        },
                        {
                            resource: Chat,
                            options: {
                                navigation: { name: 'Сообщения', icon: 'MessageSquare' },
                            },
                        },
                        {
                            resource: Message,
                            options: {
                                navigation: { name: 'Сообщения', icon: 'MessageCircle' },
                            },
                        },
                        {
                            resource: File,
                            options: {
                                navigation: { name: 'Медиа', icon: 'Image' },
                            },
                        },
                        {
                            resource: Notification,
                            options: {
                                navigation: { name: 'Система', icon: 'Bell' },
                            },
                        },
                        {
                            resource: Follower,
                            options: {
                                navigation: { name: 'Социальные', icon: 'Users' },
                            },
                        },
                        {
                            resource: Hashtag,
                            options: {
                                navigation: { name: 'Контент', icon: 'Hash' },
                            },
                        },
                    ],
                },
            }),
        }),
    ],
})
export class AdminModule {}
