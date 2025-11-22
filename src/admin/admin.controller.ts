import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AdminService } from './admin.service';
import { JwtGuard } from '../guard/jwt.guard';
import { AdminGuard } from '../guard/admin.guard';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';

@ApiTags('Admin')
@ApiBearerAuth()
@Controller('admin')
@UseGuards(JwtGuard, AdminGuard)
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  // Statistics
  @Get('statistics')
  @ApiOperation({ summary: 'Получить статистику' })
  @ApiResponse({ status: 200, description: 'Статистика успешно получена' })
  async getStatistics() {
    return this.adminService.getStatistics();
  }

  // Users endpoints
  @Get('users')
  @ApiOperation({ summary: 'Получить список всех пользователей' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список пользователей успешно получен' })
  async getAllUsers(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.findAllUsers(+page, +limit);
  }

  @Get('users/:id')
  @ApiOperation({ summary: 'Получить пользователя по ID' })
  @ApiResponse({ status: 200, description: 'Пользователь найден' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async getUserById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findUserById(id);
  }

  @Post('users')
  @ApiOperation({ summary: 'Создать нового пользователя' })
  @ApiResponse({ status: 201, description: 'Пользователь успешно создан' })
  async createUser(@Body() createUserDto: CreateUserDto) {
    return this.adminService.createUser(createUserDto);
  }

  @Put('users/:id')
  @ApiOperation({ summary: 'Обновить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async updateUser(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateUserDto: UpdateUserDto,
  ) {
    return this.adminService.updateUser(id, updateUserDto);
  }

  @Delete('users/:id')
  @ApiOperation({ summary: 'Удалить пользователя' })
  @ApiResponse({ status: 200, description: 'Пользователь успешно удален' })
  @ApiResponse({ status: 404, description: 'Пользователь не найден' })
  async deleteUser(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteUser(id);
    return { message: 'Пользователь успешно удален' };
  }

  // Chats endpoints
  @Get('chats')
  @ApiOperation({ summary: 'Получить список всех чатов' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список чатов успешно получен' })
  async getAllChats(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.findAllChats(+page, +limit);
  }

  @Get('chats/:id')
  @ApiOperation({ summary: 'Получить чат по ID' })
  @ApiResponse({ status: 200, description: 'Чат найден' })
  @ApiResponse({ status: 404, description: 'Чат не найден' })
  async getChatById(@Param('id') id: string) {
    return this.adminService.findChatById(id);
  }

  @Post('chats')
  @ApiOperation({ summary: 'Создать новый чат' })
  @ApiResponse({ status: 201, description: 'Чат успешно создан' })
  async createChat(@Body() createChatDto: CreateChatDto) {
    return this.adminService.createChat(createChatDto);
  }

  @Delete('chats/:id')
  @ApiOperation({ summary: 'Удалить чат' })
  @ApiResponse({ status: 200, description: 'Чат успешно удален' })
  @ApiResponse({ status: 404, description: 'Чат не найден' })
  async deleteChat(@Param('id') id: string) {
    await this.adminService.deleteChat(id);
    return { message: 'Чат успешно удален' };
  }

  // Messages endpoints
  @Get('messages')
  @ApiOperation({ summary: 'Получить список всех сообщений' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'chatId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Список сообщений успешно получен' })
  async getAllMessages(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
    @Query('chatId') chatId?: string,
  ) {
    if (chatId) {
      return this.adminService.findMessagesByChatId(chatId, +page, +limit);
    }
    return this.adminService.findAllMessages(+page, +limit);
  }

  @Get('messages/:id')
  @ApiOperation({ summary: 'Получить сообщение по ID' })
  @ApiResponse({ status: 200, description: 'Сообщение найдено' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async getMessageById(@Param('id') id: string) {
    return this.adminService.findMessageById(id);
  }

  @Post('messages')
  @ApiOperation({ summary: 'Создать новое сообщение' })
  @ApiResponse({ status: 201, description: 'Сообщение успешно создано' })
  async createMessage(@Body() createMessageDto: CreateMessageDto) {
    return this.adminService.createMessage(createMessageDto);
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Обновить сообщение' })
  @ApiResponse({ status: 200, description: 'Сообщение успешно обновлено' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async updateMessage(
    @Param('id') id: string,
    @Body() updateMessageDto: UpdateMessageDto,
  ) {
    return this.adminService.updateMessage(id, updateMessageDto);
  }

  @Delete('messages/:id')
  @ApiOperation({ summary: 'Удалить сообщение' })
  @ApiResponse({ status: 200, description: 'Сообщение успешно удалено' })
  @ApiResponse({ status: 404, description: 'Сообщение не найдено' })
  async deleteMessage(@Param('id') id: string) {
    await this.adminService.deleteMessage(id);
    return { message: 'Сообщение успешно удалено' };
  }

  // Reviews endpoints
  @Get('reviews')
  @ApiOperation({ summary: 'Получить список всех отзывов' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Список отзывов успешно получен' })
  async getAllReviews(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.adminService.findAllReviews(+page, +limit);
  }

  @Get('reviews/:id')
  @ApiOperation({ summary: 'Получить отзыв по ID' })
  @ApiResponse({ status: 200, description: 'Отзыв найден' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  async getReviewById(@Param('id', ParseIntPipe) id: number) {
    return this.adminService.findReviewById(id);
  }

  @Post('reviews')
  @ApiOperation({ summary: 'Создать новый отзыв' })
  @ApiResponse({ status: 201, description: 'Отзыв успешно создан' })
  async createReview(@Body() createReviewDto: CreateReviewDto) {
    return this.adminService.createReview(createReviewDto);
  }

  @Put('reviews/:id')
  @ApiOperation({ summary: 'Обновить отзыв' })
  @ApiResponse({ status: 200, description: 'Отзыв успешно обновлен' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  async updateReview(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateReviewDto: UpdateReviewDto,
  ) {
    return this.adminService.updateReview(id, updateReviewDto);
  }

  @Delete('reviews/:id')
  @ApiOperation({ summary: 'Удалить отзыв' })
  @ApiResponse({ status: 200, description: 'Отзыв успешно удален' })
  @ApiResponse({ status: 404, description: 'Отзыв не найден' })
  async deleteReview(@Param('id', ParseIntPipe) id: number) {
    await this.adminService.deleteReview(id);
    return { message: 'Отзыв успешно удален' };
  }
}
