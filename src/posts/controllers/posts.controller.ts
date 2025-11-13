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
    Patch,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { PostsService } from '../services';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { GetPostParamsDto } from '../dto/params';
import { GetPostsQueryDto } from '../dto/queries';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../../users/types';
import { JwtGuard } from '../../auth/guards';
import { PostResponseDto } from '../dto/responses';
import { CursorDto } from '../../shared/pagination/cursor';
import { CursorOptionsDto } from '../../shared/pagination/cursor';

@ApiTags('Posts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
@Controller()
export class PostsController {
    constructor(private readonly postsService: PostsService) {}

    @ApiOperation({ summary: 'Получить все посты' })
    @ApiResponse({
        status: 200,
        description: 'Посты успешно получены',
        type: () => CursorDto<PostResponseDto>,
    })
    @Get()
    async getPosts(
        @AuthUser() { sub: userId }: JwtUserData,
        @Query() queryParams: GetPostsQueryDto,
        @Query() cursorOptionsDto: CursorOptionsDto,
    ) {
        return this.postsService.findAll(queryParams, cursorOptionsDto, userId);
    }

    @ApiOperation({ summary: 'Получить пост по ID' })
    @ApiResponse({
        status: 200,
        description: 'Пост успешно получен',
        type: PostResponseDto,
    })
    @Get(':id')
    async getPostById(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { id }: GetPostParamsDto,
    ) {
        return this.postsService.findOne(id, userId);
    }
    @ApiOperation({ summary: 'Создать пост' })
    @ApiResponse({ status: 201, description: 'Пост успешно создан' })
    @Post()
    async createPost(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body() data: CreatePostDto,
    ) {
        return this.postsService.create(data, userId);
    }

    @ApiOperation({ summary: 'Обновить пост' })
    @ApiResponse({
        status: 200,
        description: 'Пост успешно обновлен',
        type: PostResponseDto,
    })
    @ApiResponse({ status: 400, description: 'Неверные данные' })
    @Put(':id')
    async updatePost(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { id }: GetPostParamsDto,
        @Body() data: UpdatePostDto,
    ) {
        return this.postsService.update(id, data, userId);
    }

    @ApiOperation({ summary: 'Удалить пост' })
    @ApiResponse({
        status: 200,
        description: 'Пост успешно удален',
        type: String,
    })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    @Delete(':id')
    deletePost(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { id }: GetPostParamsDto,
    ) {
        return this.postsService.delete(id, userId);
    }

    @ApiOperation({ summary: 'Опубликовать пост' })
    @ApiResponse({
        status: 200,
        description: 'Пост успешно опубликован',
        type: String,
    })
    @ApiResponse({ status: 400, description: 'Пост уже опубликован' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    @Patch(':id/publish')
    async publishPost(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param() { id }: GetPostParamsDto,
    ) {
        return this.postsService.publishPost(id, userId);
    }
}
