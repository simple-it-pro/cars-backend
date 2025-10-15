import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiQuery,
  ApiResponse,
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
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from '../common/constants/messages';
import { CreateGroupChatDto } from './dto/create-group-chat.dto';

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
    schema: {
      type: 'object',
      properties: {
        chats: { type: 'array', items: { $ref: '#/components/schemas/Chat' } },
        hasMore: { type: 'boolean', example: true },
        nextCursor: {
          type: 'string',
          nullable: true,
          example: '2025-09-14T08:57:59.589Z_9c9a6b7c',
        },
      },
    },
    description: 'Список чатов пользователя с пагинацией-курсором',
  })
  @ApiQuery({
    name: 'filter',
    required: false,
    enum: ['all', 'unread', 'favorite'],
    description: 'Фильтр списка чатов',
  })
  @ApiQuery({
    name: 'search',
    required: false,
    type: String,
    description: 'Поиск по названию чата или имени/нику собеседника',
  })
  @Get()
  async getUserChats(
    @AuthUser() { sub: userId }: JwtUserData,
    @Query() pagination: CursorPaginationDto,
    @Query('filter') filter?: 'all' | 'unread' | 'favorite',
    @Query('search') search?: string,
  ) {
    return this.chatsService.getUserChats(userId, pagination, filter, search);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({
    summary: 'Получение общего количества непрочитанных сообщений',
  })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: { unreadCount: { type: 'number', example: 5 } },
    },
    description: 'Количество непрочитанных сообщений по всем чатам',
  })
  @Get('unread-count')
  async getTotalUnreadCount(@AuthUser() { sub: userId }: JwtUserData) {
    const unreadCount = await this.chatsService.getTotalUnreadCount(userId);
    return { unreadCount };
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение чата по ID' })
  @ApiResponse({ status: 200, type: Chat, description: 'Данные чата' })
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
    const isParticipant = chat.users.some((user) => user.id === userId);
    if (!isParticipant) {
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
    return this.chatsService.findOrCreatePrivateChat(user, partner);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Создание группового чата' })
  @ApiResponse({ status: 201, type: Chat, description: 'Групповой чат создан' })
  @ApiResponse({ status: 400, description: 'Один из пользователей не найден' })
  @Post('group')
  async createGroupChat(
    @AuthUser() { sub: userId }: JwtUserData,
    @Body() createGroupChatDto: CreateGroupChatDto,
  ) {
    return this.chatsService.createGroupChat(userId, createGroupChatDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение сообщений чата' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        messages: {
          type: 'array',
          items: { $ref: '#/components/schemas/Message' },
        },
        hasMore: { type: 'boolean', example: true },
        nextCursor: {
          type: 'string',
          nullable: true,
          example: '2025-09-14T08:57:59.589Z_9c9a6b7c',
        },
      },
    },
    description: 'Сообщения чата с пагинацией-курсером',
  })
  @Get(':chatId/messages')
  async getMessages(
    @AuthUser() { sub: userId }: JwtUserData,
    @Param('chatId') chatId: string,
    @Query() pagination: CursorPaginationDto,
  ) {
    return this.messagesService.getMessages(chatId, pagination, userId);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Отправка сообщения в чат' })
  @ApiResponse({
    status: 201,
    type: Message,
    description: 'Сообщение отправлено',
  })
  @ApiResponse({ status: 400, description: 'Чат или пользователь не найден' })
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
    const sender = await this.usersService.getUserById(userId);
    if (!sender) {
      throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
    }
    return this.messagesService.sendMessage(chatId, sender, sendMessageDto);
  }

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Отметить сообщения как прочитанные' })
  @ApiResponse({
    status: 200,
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
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
    await this.messagesService.markMessagesAsRead(chatId, userId);
    return { success: true, message: SUCCESS_MESSAGES.CHAT.MARK_READ };
  }

  @ApiBearerAuth('JWT-auth')
  @Post(':chatId/favorite')
  @ApiOperation({ summary: 'Добавить/убрать чат из избранного' })
  async toggleFavorite(
    @Param('chatId') chatId: string,
    @AuthUser() { sub: userId }: JwtUserData,
  ) {
    return this.chatsService.toggleFavorite(chatId, userId);
  }
}
