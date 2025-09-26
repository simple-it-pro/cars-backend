import {
  Controller,
  Get,
  Post,
  Param,
  Body,
  UseGuards,
  BadRequestException,
  Query,
  ForbiddenException,
} from '@nestjs/common';
import { JwtGuard } from '../guard/jwt.guard';
import { ChatsService } from './chats.service';
import { MessagesService } from './messages.service';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from '../users/types';
import { CreateChatDto } from './dto/create-chat.dto';
import { CursorPaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';

@Controller('chats')
@UseGuards(JwtGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @Get()
  async getUserChats(
    @AuthUser() { sub: userId }: JwtUserData,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.chatsService.getUserChats(userId, pagination);
  }

  @Get('unread-count')
  async getTotalUnreadCount(@AuthUser() { sub: userId }: JwtUserData) {
    return await this.chatsService.getTotalUnreadCount(userId);
  }

  @Get(':id')
  async getChatById(
    @AuthUser() { sub: userId }: JwtUserData,
    @Param('id') id: string,
  ) {
    const chat = await this.chatsService.findChatById(id);

    if (chat.userA.id !== userId && chat.userB.id !== userId) {
      throw new ForbiddenException('Недостаточно прав');
    }

    return chat;
  }

  @Post()
  async createChat(
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() { partnerId }: CreateChatDto,
  ) {
    const user = await this.usersService.getUserById(userId);
    const partner = await this.usersService.getUserById(partnerId);

    if (!user || !partner) {
      throw new BadRequestException('Пользователь с данным id не найден');
    }

    return this.chatsService.findOrCreateChat(user, partner);
  }

  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.messagesService.getMessages(chatId, pagination);
  }

  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const chat = await this.chatsService.findChatById(chatId);
    const sender = await this.usersService.getUserById(userId);

    if (!chat) {
      throw new BadRequestException('Чат с данным id не найден');
    }

    if (!sender) {
      throw new BadRequestException('Пользователь с данным id не найден');
    }

    if (chat.userA.id !== userId && chat.userB.id !== userId) {
      throw new ForbiddenException('Пользователь не имеет доступа к чату');
    }

    return this.messagesService.sendMessage(chat, sender, sendMessageDto);
  }

  @Post(':chatId/read')
  async markAsRead(
    @Param('chatId') chatId: string,
    @AuthUser() { sub: userId }: JwtUserData,
  ) {
    return this.messagesService.markMessagesAsRead(chatId, userId);
  }
}
