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
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtGuard } from '../guard/jwt.guard';
import { ChatsService } from './chats.service';
import { MessagesService } from './messages.service';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from '../users/types';
import { CreateChatDto } from './dto/create-chat.dto';
import { CursorPaginationDto } from '../common/dto/pagination.dto';
import { SendMessageDto } from './dto/send-message.dto';
import { UsersService } from '../users/users.service';
import { Chat } from './entities/chat.entity';
import { Message } from './entities/message.entity';
import { ERROR_MESSAGES } from '../common/constants/messages';

@Controller('chats')
@UseGuards(JwtGuard)
export class ChatsController {
  constructor(
    private readonly chatsService: ChatsService,
    private readonly messagesService: MessagesService,
    private readonly usersService: UsersService,
  ) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение списка чатов пользователя' })
  @ApiResponse({
    status: 200,
    type: [Chat],
    description: 'Список чатов пользователя',
  })
  @Get()
  async getUserChats(
    @AuthUser() { sub: userId }: JwtUserData,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.chatsService.getUserChats(userId, pagination);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получение общего количества непрочитанных сообщений',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        unreadCount: {
          type: 'number',
          example: 5,
        },
      },
    },
    description: 'Количество непрочитанных сообщений',
  })
  @Get('unread-count')
  async getTotalUnreadCount(@AuthUser() { sub: userId }: JwtUserData) {
    return await this.chatsService.getTotalUnreadCount(userId);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение чата по ID' })
  @ApiResponse({
    status: 200,
    type: Chat,
    description: 'Данные чата',
  })
  @ApiResponse({
    status: 403,
    description: 'Недостаточно прав для доступа к чату',
  })
  @Get(':id')
  async getChatById(
    @AuthUser() { sub: userId }: JwtUserData,
    @Param('id') id: string,
  ) {
    const chat = await this.chatsService.findChatById(id);

    if (chat.userA.id !== userId && chat.userB.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.AUTH.NO_PERMISSIONS);
    }

    return chat;
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание нового чата с пользователем' })
  @ApiResponse({
    status: 201,
    type: Chat,
    description: 'Чат создан или найден существующий',
  })
  @ApiResponse({
    status: 400,
    description: 'Пользователь с данным id не найден',
  })
  @Post()
  async createChat(
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() { partnerId }: CreateChatDto,
  ) {
    const user = await this.usersService.getUserById(userId);
    const partner = await this.usersService.getUserById(partnerId);

    if (!user || !partner) {
      throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    return this.chatsService.findOrCreateChat(user, partner);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение сообщений чата' })
  @ApiResponse({
    status: 200,
    type: [Message],
    description: 'Список сообщений чата',
  })
  @Get(':chatId/messages')
  async getMessages(
    @Param('chatId') chatId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.messagesService.getMessages(chatId, pagination);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Отправка сообщения в чат' })
  @ApiResponse({
    status: 201,
    type: Message,
    description: 'Сообщение отправлено',
  })
  @ApiResponse({
    status: 400,
    description: 'Чат или пользователь не найден',
  })
  @ApiResponse({
    status: 403,
    description: 'Пользователь не имеет доступа к чату',
  })
  @Post(':chatId/messages')
  async sendMessage(
    @Param('chatId') chatId: string,
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() sendMessageDto: SendMessageDto,
  ) {
    const chat = await this.chatsService.findChatById(chatId);
    const sender = await this.usersService.getUserById(userId);

    if (!chat) {
      throw new BadRequestException(ERROR_MESSAGES.CHAT.NOT_FOUND);
    }

    if (!sender) {
      throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
    }

    if (chat.userA.id !== userId && chat.userB.id !== userId) {
      throw new ForbiddenException(ERROR_MESSAGES.CHAT.NO_PERMISSIONS);
    }

    return this.messagesService.sendMessage(chat, sender, sendMessageDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Отметить сообщения как прочитанные' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: {
          type: 'boolean',
          example: true,
        },
        message: {
          type: 'string',
          example: 'Сообщения отмечены как прочитанные',
        },
      },
    },
    description: 'Сообщения отмечены как прочитанные',
  })
  @Post(':chatId/read')
  async markAsRead(
    @Param('chatId') chatId: string,
    @AuthUser() { sub: userId }: JwtUserData,
  ) {
    return this.messagesService.markMessagesAsRead(chatId, userId);
  }
}
