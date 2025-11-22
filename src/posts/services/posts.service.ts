import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Post } from '../../database/entities';
import { PostStatus } from '../../database/enums';
import { CreatePostDto, UpdatePostDto } from '../dto';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
    ) {}

    async create(userId: string, createPostDto: CreatePostDto): Promise<Post> {
        const post = this.postsRepository.create({
            ...createPostDto,
            userId,
            status: PostStatus.PENDING,
        });
        return this.postsRepository.save(post);
    }

    async findAll(): Promise<Post[]> {
        return this.postsRepository.find({
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findPublished(): Promise<Post[]> {
        return this.postsRepository.find({
            where: { status: PostStatus.PUBLISHED },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findByUser(userId: string): Promise<Post[]> {
        return this.postsRepository.find({
            where: { userId },
            relations: ['user'],
            order: { createdAt: 'DESC' },
        });
    }

    async findOne(id: string): Promise<Post> {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['user'],
        });
        if (!post) {
            throw new NotFoundException('Пост не найден');
        }
        return post;
    }

    async update(id: string, userId: string, updatePostDto: UpdatePostDto): Promise<Post> {
        const post = await this.findOne(id);

        if (post.userId !== userId) {
            throw new ForbiddenException('Вы можете редактировать только свои посты');
        }

        // После редактирования отклоненного поста - снова на модерацию
        if (post.status === PostStatus.REJECTED) {
            post.status = PostStatus.PENDING;
            post.rejectionReason = null;
        }

        this.postsRepository.merge(post, updatePostDto);
        return this.postsRepository.save(post);
    }

    async delete(id: string, userId: string): Promise<void> {
        const post = await this.findOne(id);

        if (post.userId !== userId) {
            throw new ForbiddenException('Вы можете удалять только свои посты');
        }

        await this.postsRepository.softRemove(post);
    }
}
