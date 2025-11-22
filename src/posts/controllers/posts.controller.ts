import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { PostsService } from '../services';
import { CreatePostDto, UpdatePostDto } from '../dto';

interface JwtUserData {
    sub: string;
    phone: string;
}

@ApiTags('Posts')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @Post()
    @ApiOperation({ summary: 'Создать пост' })
    @ApiResponse({ status: 201, description: 'Пост создан и отправлен на модерацию' })
    async create(
        @AuthUser() user: JwtUserData,
        @Body() createPostDto: CreatePostDto,
    ) {
        return this.postsService.create(user.sub, createPostDto);
    }

    @Get('my')
    @ApiOperation({ summary: 'Получить свои посты' })
    @ApiResponse({ status: 200, description: 'Список своих постов' })
    async findMy(@AuthUser() user: JwtUserData) {
        return this.postsService.findByUser(user.sub);
    }

    @Get('feed')
    @ApiOperation({ summary: 'Получить ленту опубликованных постов' })
    @ApiResponse({ status: 200, description: 'Список опубликованных постов' })
    async findFeed() {
        return this.postsService.findPublished();
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить пост по ID' })
    @ApiResponse({ status: 200, description: 'Пост' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    async findOne(@Param('id', ParseUUIDPipe) id: string) {
        return this.postsService.findOne(id);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить пост' })
    @ApiResponse({ status: 200, description: 'Пост обновлен' })
    @ApiResponse({ status: 403, description: 'Нет прав на редактирование' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser() user: JwtUserData,
        @Body() updatePostDto: UpdatePostDto,
    ) {
        return this.postsService.update(id, user.sub, updatePostDto);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить пост' })
    @ApiResponse({ status: 200, description: 'Пост удален' })
    @ApiResponse({ status: 403, description: 'Нет прав на удаление' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    async delete(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser() user: JwtUserData,
    ) {
        await this.postsService.delete(id, user.sub);
        return { message: 'Пост удален' };
    }
}
