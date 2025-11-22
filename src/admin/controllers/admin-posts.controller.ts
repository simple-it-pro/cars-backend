import {
    Body,
    Controller,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { JwtGuard, AdminGuard } from '../../auth/guards';
import { Post } from '../../database/entities';
import { PostStatus } from '../../database/enums';
import { RejectPostDto } from '../dto/reject-post.dto';

@ApiTags('Admin - Posts')
@Controller('admin/posts')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard, AdminGuard)
export class AdminPostsController {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Получить все посты' })
    @ApiResponse({ status: 200, description: 'Список всех постов' })
    async getAll() {
        return this.postsRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    @Get('pending')
    @ApiOperation({ summary: 'Получить посты на модерацию' })
    @ApiResponse({ status: 200, description: 'Список постов на модерацию' })
    async getPending() {
        return this.postsRepository.find({
            where: { status: PostStatus.PENDING },
            relations: ['user'],
            order: { createdAt: 'ASC' }, // Сначала старые
        });
    }

    @Get('published')
    @ApiOperation({ summary: 'Получить опубликованные посты' })
    @ApiResponse({ status: 200, description: 'Список опубликованных постов' })
    async getPublished() {
        return this.postsRepository.find({
            where: { status: PostStatus.PUBLISHED },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    @Patch(':id/approve')
    @ApiOperation({ summary: 'Одобрить пост' })
    @ApiResponse({ status: 200, description: 'Пост одобрен' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    async approve(@Param('id', ParseUUIDPipe) id: string) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!post) {
            throw new Error('Пост не найден');
        }

        post.status = PostStatus.PUBLISHED;
        post.rejectionReason = null;

        return this.postsRepository.save(post);
    }

    @Patch(':id/reject')
    @ApiOperation({ summary: 'Отклонить пост' })
    @ApiResponse({ status: 200, description: 'Пост отклонен' })
    @ApiResponse({ status: 404, description: 'Пост не найден' })
    async reject(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() rejectPostDto: RejectPostDto,
    ) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!post) {
            throw new Error('Пост не найден');
        }

        post.status = PostStatus.REJECTED;
        post.rejectionReason = rejectPostDto.reason;

        return this.postsRepository.save(post);
    }
}
