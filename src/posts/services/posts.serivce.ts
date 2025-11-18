import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Brackets,
    FindOptionsWhere,
    In,
    Repository,
    SelectQueryBuilder,
} from 'typeorm';

import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { FilesService } from '../../files/services';
import { HashtagsService } from '../../hastags/services';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { FileStatusEnum, PostStatusEnum } from '../../database/enums';
import { FileEntity, Post, PostFile } from '../../database/entities';
import { PostResponseDto } from '../dto/responses';
import { GetPostsQueryDto } from '../dto/queries';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        private readonly filesService: FilesService,
        private readonly hashtagsService: HashtagsService,
    ) {}

    async findAll(
        { includes, hashtags, userId: userIdQuery }: GetPostsQueryDto,
        userId: string,
    ) {
        const postsQb = this.postsRepository.createQueryBuilder('post');

        console.log('userIdQuery', userIdQuery);
        console.log('userId', userId);

        if (userIdQuery) {
            if (userIdQuery === userId) {
                postsQb.where('post.userId = :userIdQuery', { userIdQuery });
            } else {
                postsQb
                    .where('post.userId = :userIdQuery', { userIdQuery })
                    .andWhere('post.status = :status', {
                        status: PostStatusEnum.PUBLISHED,
                    });
            }
        } else {
            postsQb.where(
                new Brackets((qb) => {
                    qb.where('post.userId = :userId', { userId });
                    qb.orWhere('post.status = :status', {
                        status: PostStatusEnum.PUBLISHED,
                    });
                }),
            );
        }

        if (hashtags) {
            postsQb.andWhere(
                (qb: SelectQueryBuilder<Post>) =>
                    'post.id IN ' +
                    qb
                        .subQuery()
                        .select('post_sub.id')
                        .from(Post, 'post_sub')
                        .innerJoin('post_sub.hashtags', 'filterHashtag')
                        .where('filterHashtag.name IN (:...hashtags)', {
                            hashtags,
                        })
                        .groupBy('post_sub.id')
                        .having('COUNT(DISTINCT filterHashtag.id) = :count', {
                            count: hashtags.length,
                        })
                        .getQuery(),
            );
        }

        if (includes) {
            for (const include of includes) {
                if (include === 'files')
                    postsQb
                        .leftJoinAndSelect('post.files', 'files')
                        .leftJoinAndSelect('files.file', 'file');
                if (include === 'hashtags')
                    postsQb.leftJoinAndSelect('post.hashtags', 'hashtags');
            }
        }

        const posts = await postsQb.getMany();

        if (includes?.includes('files')) {
            const postsWithFiles = await Promise.all(
                posts.map((post) => this.addSignedUrlsToPost(post)),
            );

            return postsWithFiles;
        }

        return posts;
    }

    async findOne(id: string, userId: string) {
        const where: FindOptionsWhere<Post>[] = [
            { id, status: PostStatusEnum.PUBLISHED },
        ];
        if (userId) where.push({ id, user: { id: userId } });

        const post = await this.postsRepository.findOne({
            relations: ['files', 'files.file', 'hashtags'],
            where,
        });

        return post && this.addSignedUrlsToPost(post);
    }

    async create(
        { title, description, imagesIds }: CreatePostDto,
        userId: string,
    ) {
        const hashtags =
            await this.hashtagsService.getHashatgsFromTextAndSave(description);

        const savedPost = await this.postsRepository.manager.transaction(
            async (manager) => {
                const newPost = manager.create(Post, {
                    title,
                    description,
                    status: PostStatusEnum.DRAFT,
                    hashtags,
                    user: {
                        id: userId,
                    },
                });

                const savedPost = await manager.save(Post, newPost);

                const files = await manager.find(FileEntity, {
                    where: {
                        id: In(imagesIds),
                        status: FileStatusEnum.TEMPORARY,
                    },
                });

                if (files.length !== imagesIds.length)
                    throw new BadRequestException(
                        ERROR_MESSAGES.POST.FILES_NOT_FOUND,
                    );

                const newPostFiles = imagesIds.map((imageId, index) => ({
                    order: index,
                    file: {
                        id: imageId,
                        status: FileStatusEnum.ATTACHED,
                    },
                    post: {
                        id: savedPost.id,
                    },
                }));

                await manager.save(PostFile, newPostFiles);

                await manager.update(FileEntity, imagesIds, {
                    status: FileStatusEnum.ATTACHED,
                });

                return savedPost;
            },
        );

        return this.findOne(savedPost.id, userId);
    }

    // TODO: Remove dublicates from imagesIds array
    async update(
        id: string,
        { title, description, imagesIds }: UpdatePostDto = {},
        userId: string,
    ) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['files', 'files.file', 'user'],
        });
        if (!post) throw new NotFoundException(ERROR_MESSAGES.POST.NOT_FOUND);
        if (post.user.id !== userId)
            throw new ForbiddenException(ERROR_MESSAGES.POST.ACCESS_DENIED);

        const hashtags = description
            ? {
                  hashtags:
                      await this.hashtagsService.getHashatgsFromTextAndSave(
                          description,
                      ),
              }
            : {};

        await this.postsRepository.manager.transaction(async (manager) => {
            if (imagesIds) {
                const files = await manager.find(FileEntity, {
                    where: [
                        {
                            id: In(imagesIds),
                            status: FileStatusEnum.TEMPORARY,
                        },
                        {
                            id: In(imagesIds),
                            status: FileStatusEnum.ATTACHED,
                            postFile: {
                                post: {
                                    id: id,
                                },
                            },
                        },
                    ],
                });

                if (files.length !== imagesIds.length)
                    throw new BadRequestException(
                        ERROR_MESSAGES.POST.FILES_NOT_FOUND,
                    );

                const filesToUpdate = imagesIds.map((fileId, index) => {
                    const fileInPost = post.files.find(
                        (postFile) => postFile.file.id === fileId,
                    );

                    return {
                        id: fileInPost ? fileInPost.id : undefined,
                        order: index,
                        file: {
                            id: fileId,
                            status: FileStatusEnum.ATTACHED,
                        },
                        post: {
                            id,
                        },
                    };
                });

                const filesToDelete = post.files.filter(
                    (postFile) => !imagesIds.includes(postFile.file.id),
                );

                if (filesToDelete.length) {
                    await manager.delete(
                        PostFile,
                        filesToDelete.map((postFile) => postFile.id),
                    );
                    await manager.update(
                        FileEntity,
                        filesToDelete.map((postFile) => postFile.file.id),
                        { status: FileStatusEnum.TEMPORARY },
                    );
                }
                if (filesToUpdate.length) {
                    await manager.save(PostFile, filesToUpdate);
                    await manager.update(
                        FileEntity,
                        filesToUpdate.map((file) => file.file.id),
                        { status: FileStatusEnum.ATTACHED },
                    );
                }
            }

            await manager.save(Post, {
                id: post.id,
                title,
                description,
                ...hashtags,
            });
        });

        return this.findOne(id, userId);
    }

    async delete(id: string, userId: string) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['files', 'files.file', 'user'],
        });
        if (!post) return 'Success';

        if (post.user.id !== userId)
            throw new ForbiddenException(ERROR_MESSAGES.POST.ACCESS_DENIED);

        await this.postsRepository.manager.transaction(async (manager) => {
            await manager.delete(Post, id);
            await manager.update(
                FileEntity,
                post.files.map((file) => file.file.id),
                { status: FileStatusEnum.TEMPORARY },
            );
        });

        return SUCCESS_MESSAGES.POST.DELETED;
    }

    async publishPost(id: string, userId: string) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['user'],
        });

        if (!post) throw new NotFoundException(ERROR_MESSAGES.POST.NOT_FOUND);
        if (post.user.id !== userId)
            throw new ForbiddenException(ERROR_MESSAGES.POST.ACCESS_DENIED);
        if (post.status !== PostStatusEnum.DRAFT)
            throw new BadRequestException(
                ERROR_MESSAGES.POST.ALREADY_PUBLISHED,
            );

        await this.postsRepository.update(id, {
            status: PostStatusEnum.PUBLISHED,
        });

        return SUCCESS_MESSAGES.POST.PUBLISHED;
    }

    private async addSignedUrlsToPost(post: Post): Promise<PostResponseDto> {
        if (!post.files || post.files.length === 0)
            return post as unknown as PostResponseDto;

        const files = post.files
            .sort((a, b) => a.order - b.order)
            .map((file) => file.file);
        const filesWithUrls =
            await this.filesService.addSignedUrlsToFiles(files);

        return { ...post, files: filesWithUrls };
    }
}
