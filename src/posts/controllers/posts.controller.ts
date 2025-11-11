import {
    Controller,
    Get,
    Param,
    Post,
    Body,
    UseGuards,
    Put,
    Delete,
    Query,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { PostsService } from '../services';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { GetPostParamsDto } from '../dto/params';
import { GetPostsQueryDto } from '../dto/queries';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { JwtGuard } from '../../auth/guards';

@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller()
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @ApiOperation({ summary: 'Получить все посты' })
    @ApiResponse({ status: 200, description: 'Посты успешно получены' })
    @Get()
    async getPosts(@Query() queryParams: GetPostsQueryDto) {
        console.log('queryParams: ', queryParams);
        return this.postsService.findAll(queryParams);
    }

    @ApiOperation({ summary: 'Получить пост по ID' })
    @ApiResponse({ status: 200, description: 'Пост успешно получен' })
    @Get(':id')
    async getPostById(@Param() { id }: GetPostParamsDto) {
        return this.postsService.findOne(id);
    }
    @ApiOperation({ summary: 'Создать пост' })
    @ApiResponse({ status: 201, description: 'Пост успешно создан' })
    @Post()
    async createPost(
        @Body() data: CreatePostDto,
        @AuthUser() { sub: userId }: JwtUserData,
    ) {
        return this.postsService.create(data, userId);
    }

    @ApiOperation({ summary: 'Обновить пост' })
    @ApiResponse({ status: 200, description: 'Пост успешно обновлен' })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @Put(':id')
    async updatePost(
        @Param() { id }: GetPostParamsDto,
        @Body() data: UpdatePostDto,
    ) {
        return this.postsService.update(id, data);
    }

    @ApiOperation({ summary: 'Удалить пост' })
    @ApiResponse({ status: 200, description: 'Пост успешно удален' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    @Delete(':id')
    deletePost(@Param() { id }: GetPostParamsDto) {
        return this.postsService.delete(id);
    }
}
