import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    MessageBody,
    ConnectedSocket,
    OnGatewayConnection,
    OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';

import { AuthService } from '../../auth/services';

@WebSocketGateway({
    namespace: '/notifications',
    cors: {
        origin: '*',
    },
})
@Injectable()
export class NotificationsGateway
    implements OnGatewayConnection, OnGatewayDisconnect
{
    @WebSocketServer()
    server: Server;

    private readonly logger = new Logger(NotificationsGateway.name);
    private connectedUsers = new Map<number, string>();

    constructor(private readonly authService: AuthService) {}

    async handleConnection(socket: Socket) {
        try {
            const token: string = socket.handshake.auth.token;
            if (!token) {
                this.logger.warn('Connection attempt without token');
                socket.disconnect();
                return;
            }

            const payload = await this.authService.verifyWebSocketToken(token);
            const userId: number = payload.sub;

            this.connectedUsers.set(userId, socket.id);
            await socket.join(`user_${userId}`);

            this.logger.log(
                `User ${userId} connected to notifications with socket ${socket.id}`,
            );

            this.sendUnreadCount(userId);
        } catch (error) {
            this.logger.error('Notifications connection error:', error);
            socket.disconnect();
        }
    }

    handleDisconnect(socket: Socket) {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === socket.id) {
                this.connectedUsers.delete(userId);
                this.logger.log(
                    `User ${userId} disconnected from notifications`,
                );
                break;
            }
        }
    }

    @SubscribeMessage('mark_as_read')
    handleMarkAsRead(
        @ConnectedSocket() socket: Socket,
        @MessageBody() data: { notificationId: number },
    ) {
        try {
            const userId = this.getUserIdFromSocket(socket);
            if (!userId) {
                socket.emit('error', { message: 'User not found' });
                return;
            }

            socket.emit('notification_marked_read', {
                notificationId: data.notificationId,
            });

            this.sendUnreadCount(userId);
        } catch (error) {
            this.logger.error('Error marking notification as read:', error);
            socket.emit('error', {
                message: 'Failed to mark notification as read',
            });
        }
    }

    @SubscribeMessage('mark_all_as_read')
    handleMarkAllAsRead(@ConnectedSocket() socket: Socket) {
        try {
            const userId = this.getUserIdFromSocket(socket);
            if (!userId) {
                socket.emit('error', { message: 'User not found' });
                return;
            }

            socket.emit('all_notifications_marked_read');

            this.sendUnreadCount(userId);
        } catch (error) {
            this.logger.error(
                'Error marking all notifications as read:',
                error,
            );
            socket.emit('error', {
                message: 'Failed to mark all notifications as read',
            });
        }
    }

    @SubscribeMessage('get_unread_count')
    handleGetUnreadCount(@ConnectedSocket() socket: Socket) {
        try {
            const userId = this.getUserIdFromSocket(socket);
            if (!userId) {
                socket.emit('error', { message: 'User not found' });
                return;
            }

            this.sendUnreadCount(userId);
        } catch (error) {
            this.logger.error('Error getting unread count:', error);
            socket.emit('error', { message: 'Failed to get unread count' });
        }
    }

    sendNewNotification(userId: number, notification: any) {
        this.server.to(`user_${userId}`).emit('new_notification', {
            notification,
        });

        this.sendUnreadCount(userId);

        this.logger.log(`New notification sent to user ${userId}`);
    }

    sendUnreadCount(userId: number) {
        this.server.to(`user_${userId}`).emit('unread_count_updated');
    }

    sendNotificationRead(userId: number, notificationId: number) {
        this.server.to(`user_${userId}`).emit('notification_read', {
            notificationId,
        });

        this.sendUnreadCount(userId);
    }

    sendAllNotificationsRead(userId: number) {
        this.server.to(`user_${userId}`).emit('all_notifications_read');

        this.sendUnreadCount(userId);
    }

    sendNotificationDeleted(userId: number, notificationId: number) {
        this.server.to(`user_${userId}`).emit('notification_deleted', {
            notificationId,
        });

        this.sendUnreadCount(userId);
    }

    private getUserIdFromSocket(socket: Socket): number | null {
        for (const [userId, socketId] of this.connectedUsers.entries()) {
            if (socketId === socket.id) {
                return userId;
            }
        }
        return null;
    }
}
