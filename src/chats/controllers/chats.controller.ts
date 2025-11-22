import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UploadedFile,
    UploadedFiles,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiQuery,
    ApiResponse,
} from '@nestjs/swagger';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';

import { JwtGuard } from '../../auth/guards';
import { ChatsService, MessagesService } from '../services';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import {
    ChatIdsDto,
    CreateChatDto,
    CreateGroupChatDto,
    EditMessageDto,
    SendMessageDto,
    SendVoiceMessageDto,
} from '../dto';
import { CursorPaginationDto } from '../../common/dto';
import { UsersService } from '../../users/services';
import { Chat, Message } from '../../database/entities';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import {
    CHAT_OPERATIONS,
    CHAT_QUERIES,
    CHAT_RESPONSES,
    MESSAGE_BODIES,
} from '../chats.swagger';
import {
    ChatIdParamsDto,
    DeleteMessageParamsDto,
    EditMessageParamsDto,
    ForwardMessageParamsDto,
    ReplyMessageParamsDto,
} from '../dto/params';

@Controller()
@UseGuards(JwtGuard)
@ApiBearerAuth('JWT-auth')
export class ChatsController {
    constructor(
        private readonly chatsService: ChatsService,
        private readonly messagesService: MessagesService,
        private readonly usersService: UsersService,
    ) {}

    @ApiOperation({ summary: 'Получение списка чатов пользователя' })
    @ApiResponse(CHAT_RESPONSES.PAGINATED_CHATS)
    @ApiQuery(CHAT_QUERIES.FILTER)
    @ApiQuery(CHAT_QUERIES.SEARCH)
    @Get()
    async getUserChats(
        @AuthUser() { sub: userId }: JwtUserData,
        @Query() pagination: CursorPaginationDto,
        @Query('filter') filter?: 'all' | 'unread' | 'favorite',
        @Query('search') search?: string,
    ) {
        return this.chatsService.getUserChats(
            userId,
            pagination,
            filter,
            search,
        );
    }

    @ApiOperation({
        summary: 'Получение общего количества непрочитанных сообщений',
    })
    @ApiResponse(CHAT_RESPONSES.UNREAD_COUNT)
    @Get('unread-count')
    async getTotalUnreadCount(@AuthUser() { sub: userId }: JwtUserData) {
        const unreadCount = await this.chatsService.getTotalUnreadCount(userId);
        return { unreadCount };
    }

    @ApiOperation({
        summary: 'Получение количества непрочитанных сообщений для чата',
    })
    @ApiResponse(CHAT_RESPONSES.UNREAD_COUNT)
    @Get('unread-count/:chatId')
    async getUnreadCountForChat(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { chatId }: ChatIdParamsDto,
    ) {
        const unreadCount = await this.chatsService.getUnreadCountForChat(
            userId,
            chatId,
        );
        return { unreadCount };
    }

    @ApiOperation({ summary: 'Получение чата по ID' })
    @ApiResponse({ status: 200, type: Chat, description: 'Данные чата' })
    @ApiResponse({
        status: 403,
        description: 'Недостаточно прав для доступа к чату',
    })
    @Get(':id')
    async getChatById(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('id', ParseUUIDPipe) id: string,
    ) {
        return this.chatsService.findChatById(id, userId);
    }

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

    @ApiOperation({ summary: 'Создание группового чата' })
    @ApiResponse({
        status: 201,
        type: Chat,
        description: 'Групповой чат создан',
    })
    @ApiResponse({
        status: 400,
        description: 'Один из пользователей не найден',
    })
    @Post('group')
    async createGroupChat(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() createGroupChatDto: CreateGroupChatDto,
    ) {
        return this.chatsService.createGroupChat(userId, createGroupChatDto);
    }

    @Post('read-all')
    @ApiOperation(CHAT_OPERATIONS.MARK_ALL_READ)
    @ApiResponse(CHAT_RESPONSES.MARK_ALL_READ_RESPONSE)
    async markAllChatsAsRead(@AuthUser() { sub: userId }: JwtUserData) {
        return this.chatsService.markAllChatsAsRead(userId);
    }

    @Post('read')
    @ApiOperation(CHAT_OPERATIONS.MARK_CHATS_READ)
    @ApiBody(MESSAGE_BODIES.CHAT_IDS_BODY)
    @ApiResponse(CHAT_RESPONSES.MARK_CHATS_READ_RESPONSE)
    async markChatsAsRead(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() dto: ChatIdsDto,
    ) {
        return this.chatsService.markChatsAsRead(userId, dto.chatIds);
    }

    @Delete('delete-chats')
    @ApiOperation(CHAT_OPERATIONS.DELETE_CHATS)
    @ApiBody(MESSAGE_BODIES.CHAT_IDS_BODY)
    @ApiResponse(CHAT_RESPONSES.DELETE_CHATS_RESPONSE)
    async deleteChats(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() dto: ChatIdsDto,
    ) {
        return this.chatsService.deleteChats(userId, dto.chatIds);
    }

    @Delete(':id')
    @ApiOperation(CHAT_OPERATIONS.DELETE_CHAT)
    @ApiResponse(CHAT_RESPONSES.DELETE_CHAT_RESPONSE)
    async deleteChat(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('id', ParseUUIDPipe) chatId: string,
    ) {
        return this.chatsService.deleteChats(userId, [chatId]);
    }

    @ApiOperation({ summary: 'Получение сообщений чата' })
    @ApiResponse(CHAT_RESPONSES.PAGINATED_MESSAGES)
    @Get(':chatId/messages')
    async getMessages(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { chatId }: ChatIdParamsDto,
        @Query() pagination: CursorPaginationDto,
    ) {
        return this.messagesService.getMessages(chatId, pagination, userId);
    }

    @ApiOperation({ summary: 'Отправить сообщение в чат' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(MESSAGE_BODIES.SEND_MESSAGE)
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
    @UseInterceptors(FilesInterceptor('files', 10))
    async sendMessage(
        @Param() { chatId }: ChatIdParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() sendMessageDto: SendMessageDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const sender = await this.usersService.getUserById(userId);
        if (!sender) {
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
        }
        return this.messagesService.sendMessage(
            chatId,
            sender,
            sendMessageDto,
            files,
        );
    }

    @ApiOperation({ summary: 'Отправить голосовое сообщение' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(MESSAGE_BODIES.SEND_VOICE_MESSAGE)
    @ApiResponse({
        status: 201,
        type: Message,
        description: 'Голосовое сообщение отправлено',
    })
    @ApiResponse({
        status: 400,
        description: 'Файл не предоставлен или имеет недопустимый формат',
    })
    @ApiResponse({
        status: 403,
        description: 'Пользователь не имеет доступа к чату',
    })
    @Post(':chatId/messages/voice')
    @UseInterceptors(FileInterceptor('file'))
    async sendVoiceMessage(
        @Param() { chatId }: ChatIdParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() dto: SendVoiceMessageDto,
        @UploadedFile() file: Express.Multer.File,
    ) {
        const sender = await this.usersService.getUserById(userId);

        if (!sender)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        return this.messagesService.sendVoiceMessage(chatId, sender, dto, file);
    }

    @ApiOperation({ summary: 'Редактирование сообщения' })
    @ApiResponse({
        status: 200,
        type: Message,
        description: 'Сообщение отредактировано',
    })
    @ApiResponse({ status: 400, description: 'Пустой текст или нет изменений' })
    @ApiResponse({ status: 403, description: 'Недостаточно прав' })
    @ApiResponse({ status: 404, description: 'Сообщение или чат не найдены' })
    @Patch(':chatId/messages/:messageId')
    async editMessage(
        @Param() { chatId, messageId }: EditMessageParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() dto: EditMessageDto,
    ) {
        return this.messagesService.editMessage(chatId, messageId, userId, dto);
    }

    @ApiOperation({ summary: 'Удаление сообщения' })
    @ApiResponse(CHAT_RESPONSES.SUCCESS_RESPONSE)
    @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
    @ApiResponse({ status: 403, description: 'Недостаточно прав для удаления' })
    @Delete(':chatId/messages/:messageId')
    async deleteMessage(
        @Param() { chatId, messageId }: DeleteMessageParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        return this.messagesService.deleteMessage(chatId, messageId, userId);
    }

    @ApiOperation({ summary: 'Ответ на сообщение' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(MESSAGE_BODIES.REPLY_MESSAGE)
    @ApiResponse({ status: 201, type: Message, description: 'Ответ отправлен' })
    @ApiResponse({
        status: 400,
        description: 'Чат/пользователь не найден или некорректное тело запроса',
    })
    @ApiResponse({ status: 403, description: 'Недостаточно прав' })
    @Post(':chatId/messages/:messageId/reply')
    @UseInterceptors(FilesInterceptor('files', 10))
    async replyToMessage(
        @Param() { chatId, messageId }: ReplyMessageParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() body: SendMessageDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const sender = await this.usersService.getUserById(userId);
        if (!sender)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (body.forwardFromMessageId) {
            throw new BadRequestException(
                ERROR_MESSAGES.MESSAGE.FORWARD_ID_NOT_ALLOWED_HERE,
            );
        }

        const dto: SendMessageDto = { ...body, replyToMessageId: messageId };
        return this.messagesService.sendMessage(chatId, sender, dto, files);
    }

    @ApiOperation({ summary: 'Переслать сообщение' })
    @ApiConsumes('multipart/form-data')
    @ApiBody(MESSAGE_BODIES.FORWARD_MESSAGE)
    @ApiResponse({ status: 201, type: Message, description: 'Переслано' })
    @ApiResponse({
        status: 400,
        description: 'Чат/пользователь не найден или некорректное тело запроса',
    })
    @ApiResponse({ status: 403, description: 'Недостаточно прав' })
    @Post(':chatId/messages/:messageId/forward')
    @UseInterceptors(FilesInterceptor('files', 10))
    async forwardMessage(
        @Param() { chatId, messageId }: ForwardMessageParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() body: SendMessageDto,
        @UploadedFiles() files?: Express.Multer.File[],
    ) {
        const sender = await this.usersService.getUserById(userId);
        if (!sender)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (body.replyToMessageId) {
            throw new BadRequestException(
                ERROR_MESSAGES.MESSAGE.REPLY_ID_NOT_ALLOWED_HERE,
            );
        }

        const dto: SendMessageDto = {
            ...body,
            forwardFromMessageId: messageId,
        };
        return this.messagesService.sendMessage(chatId, sender, dto, files);
    }

    @ApiOperation({ summary: 'Отметить сообщения как прочитанные' })
    @ApiResponse(CHAT_RESPONSES.SUCCESS_RESPONSE)
    @Post(':chatId/read')
    async markAsRead(
        @Param() { chatId }: ChatIdParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        await this.messagesService.markMessagesAsRead(chatId, userId);
        return { success: true, message: SUCCESS_MESSAGES.CHAT.MARK_READ };
    }

    @ApiOperation({ summary: 'Добавить/убрать чат из избранного' })
    @ApiResponse(CHAT_RESPONSES.TOGGLE_FAVORITE_RESPONSE)
    @Post(':chatId/favorite')
    async toggleFavorite(
        @Param() { chatId }: ChatIdParamsDto,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        return this.chatsService.toggleFavorite(chatId, userId);
    }
}
