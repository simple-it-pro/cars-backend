import { Injectable } from '@nestjs/common';
import { CreateNotificationDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../../database/entities';
import { Repository } from 'typeorm';
import { NotificationType } from '../../common/types';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    async getAll(userId: number, filterType: NotificationType) {
        return this.notificationRepository.find({
            where: {
                user: {
                    id: userId,
                },
                type: filterType,
            },
            order: {
                createdAt: 'DESC',
            },
        });
    }

    async getUnreadCount(userId: number) {
        return this.notificationRepository.count({
            where: {
                user: {
                    id: userId,
                },
                isRead: false,
            },
        });
    }

    async markAsRead(userId: number, notificationId: number) {
        return this.notificationRepository.update(notificationId, {
            isRead: true,
        });
    }

    async markAllAsRead(userId: number) {
        return this.notificationRepository.update(
            {
                user: {
                    id: userId,
                },
            },
            {
                isRead: true,
            },
        );
    }

    async create(userId: number, dto: CreateNotificationDto) {
        return this.notificationRepository.save({
            ...dto,
            user: {
                id: userId,
            },
        });
    }

    async remove(userId: number, notificationId: number) {
        return this.notificationRepository.delete(notificationId);
    }
}
