import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateNotificationDto } from '../dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Notification } from '../../database/entities';
import { Repository } from 'typeorm';
import { NotificationType } from '../../common/types';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';

@Injectable()
export class NotificationsService {
    constructor(
        @InjectRepository(Notification)
        private readonly notificationRepository: Repository<Notification>,
    ) {}

    async getAll(userId: number, filterType?: NotificationType) {
        const where: any = {
            user: {
                id: userId,
            },
        };

        if (filterType) {
            where.type = filterType;
        }

        return this.notificationRepository.find({
            where,
            order: {
                createdAt: 'DESC',
            },
            relations: ['user'],
        });
    }

    async getUnreadCount(userId: number): Promise<{ count: number }> {
        const count = await this.notificationRepository.count({
            where: {
                user: {
                    id: userId,
                },
                isRead: false,
            },
        });

        return { count };
    }

    async markAsRead(
        userId: number,
        notificationId: number,
    ): Promise<{ message: string }> {
        const notification = await this.notificationRepository.findOne({
            where: {
                id: notificationId,
                user: { id: userId },
            },
        });

        if (!notification) {
            throw new NotFoundException(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);
        }

        await this.notificationRepository.update(notificationId, {
            isRead: true,
        });

        return { message: SUCCESS_MESSAGES.NOTIFICATION.MARKED_AS_READ };
    }

    async markAllAsRead(
        userId: number,
    ): Promise<{ message: string; affected: number }> {
        const result = await this.notificationRepository.update(
            {
                user: { id: userId },
                isRead: false,
            },
            {
                isRead: true,
            },
        );

        return {
            message: SUCCESS_MESSAGES.NOTIFICATION.ALL_MARKED_AS_READ,
            affected: result.affected || 0,
        };
    }

    async create(
        userId: number,
        dto: CreateNotificationDto,
    ): Promise<Notification> {
        const notification = this.notificationRepository.create({
            ...dto,
            user: { id: userId },
        });

        return this.notificationRepository.save(notification);
    }

    async remove(
        userId: number,
        notificationId: number,
    ): Promise<{ message: string }> {
        const notification = await this.notificationRepository.findOne({
            where: {
                id: notificationId,
                user: { id: userId },
            },
        });

        if (!notification) {
            throw new NotFoundException(ERROR_MESSAGES.NOTIFICATION.NOT_FOUND);
        }

        await this.notificationRepository.delete(notificationId);

        return { message: SUCCESS_MESSAGES.NOTIFICATION.DELETED };
    }
}
