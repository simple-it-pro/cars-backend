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
import { AuthService } from '../auth/auth.service';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
@Injectable()
export class ChatsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatsGateway.name);
  private connectedUsers = new Map<number, string>();

  constructor(
    private readonly authService: AuthService, // Инжектим AuthService
  ) {}

  async handleConnection(socket: Socket) {
    try {
      const token = socket.handshake.auth.token;
      if (!token) {
        socket.disconnect();
        return;
      }

      const payload = await this.authService.verifyWebSocketToken(token);
      const userId = payload.sub;

      this.connectedUsers.set(userId, socket.id);

      socket.join(`user_${userId}`);

      this.logger.log(`User ${userId} connected with socket ${socket.id}`);
    } catch (error) {
      this.logger.error('Connection error:', error);
      socket.disconnect();
    }
  }

  handleDisconnect(socket: Socket) {
    for (const [userId, socketId] of this.connectedUsers.entries()) {
      if (socketId === socket.id) {
        this.connectedUsers.delete(userId);
        this.logger.log(`User ${userId} disconnected`);
        break;
      }
    }
  }

  @SubscribeMessage('join_chat')
  handleJoinChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatId: string,
  ) {
    socket.join(`chat_${chatId}`);
    this.logger.log(`Socket ${socket.id} joined chat ${chatId}`);
  }

  @SubscribeMessage('leave_chat')
  handleLeaveChat(
    @ConnectedSocket() socket: Socket,
    @MessageBody() chatId: string,
  ) {
    socket.leave(`chat_${chatId}`);
    this.logger.log(`Socket ${socket.id} left chat ${chatId}`);
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() socket: Socket,
    @MessageBody() data: { chatId: string; isTyping: boolean },
  ) {
    socket.to(`chat_${data.chatId}`).emit('user_typing', {
      chatId: data.chatId, // Добавить эту строку
      userId: this.getUserIdFromSocket(socket),
      isTyping: data.isTyping,
    });
  }

  sendNewMessageNotification(
    chatId: string,
    message: any,
    recipientId: number,
  ) {
    this.server.to(`user_${recipientId}`).emit('new_message', {
      chatId,
      message,
    });
  }

  sendReadReceipt(chatId: string, userId: number) {
    this.server.to(`chat_${chatId}`).emit('messages_read', {
      chatId,
      userId,
      readAt: new Date(),
    });
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
