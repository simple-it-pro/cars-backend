import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, In, Repository, SelectQueryBuilder } from 'typeorm';

import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { FilesService } from '../../files/services';
import { HashtagsService } from '../../hastags/services';
import { CreatePostDto, UpdatePostDto } from '../dto';
import { FileStatusEnum, PostStatusEnum } from '../../database/enums';
import { FileEntity, Post, PostFile } from '../../database/entities';
import {
    createCursorMeta,
    CursorDto,
    CursorOptionsDto,
    parseCompositeCursor,
} from '../../shared/pagination/cursor';
import { PostResponseDto } from '../dto/responses';
import { GetPostsQueryDto } from '../dto/queries';
import { PostWithFile } from '../types';

@Injectable()
export class PostsService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        private readonly filesService: FilesService,
        private readonly hashtagsService: HashtagsService,
    ) {}

    makePostQueryBuilder({
        includes,
        hashtags,
    }: Omit<GetPostsQueryDto, 'userId'>) {
        const postsQb = this.postsRepository
            .createQueryBuilder('post')
            .select([
                'post.id AS id',
                'post.description AS description',
                'post.status AS status',
                'post.createdAt AS "createdAt"',
                'post.updatedAt AS "updatedAt"',
            ])
            .addSelect((qb: SelectQueryBuilder<Post>) =>
                qb
                    .subQuery()
                    .select(`to_jsonb(file)`, 'cover')
                    .from(PostFile, 'post_file')
                    .where('post_file.postId = post.id')
                    .orderBy('post_file.order', 'ASC')
                    .leftJoin('post_file.file', 'file')
                    .groupBy('post_file.id')
                    .addGroupBy('file.id')
                    .limit(1),
            )
            .groupBy('post.id');

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
                        .addSelect(
                            `
                            jsonb_agg(
                                DISTINCT to_jsonb(files) || jsonb_build_object(
                                    'file', to_jsonb(file)
                                )
                            ) AS files
                        `,
                        )
                        .leftJoin('post.files', 'files')
                        .leftJoin('files.file', 'file')
                        .addGroupBy('files.id');
                if (include === 'hashtags')
                    postsQb
                        .addSelect(`jsonb_agg(hashtags)`, 'hashtags')
                        .leftJoin('post.hashtags', 'hashtags');
            }
        }

        return postsQb;
    }

    async findAll(
        { includes, hashtags, userId: userIdQuery }: GetPostsQueryDto,
        cursorOptionsDto: CursorOptionsDto,
        userId: string,
    ) {
        const postsQb = this.makePostQueryBuilder({ includes, hashtags });

        // Build base where conditions
        if (userIdQuery) {
            if (userIdQuery === userId) {
                postsQb.andWhere('post.userId = :userIdQuery', { userIdQuery });
            } else {
                postsQb
                    .andWhere('post.userId = :userIdQuery', { userIdQuery })
                    .andWhere('post.status = :status', {
                        status: PostStatusEnum.PUBLISHED,
                    });
            }
        } else {
            postsQb.andWhere(
                new Brackets((qb) => {
                    qb.where('post.userId = :userId', { userId });
                    qb.orWhere('post.status = :status', {
                        status: PostStatusEnum.PUBLISHED,
                    });
                }),
            );
        }

        postsQb
            .orderBy('post.createdAt', cursorOptionsDto.order)
            .addOrderBy('post.id', cursorOptionsDto.order)
            .limit(cursorOptionsDto.take);

        const itemCount = await postsQb.getCount();

        if (cursorOptionsDto.cursor) {
            const { date, id } = parseCompositeCursor(cursorOptionsDto.cursor);
            postsQb.andWhere(
                new Brackets((qb) => {
                    qb.where('post.createdAt <= :date', { date });
                    qb.orWhere('post.createdAt = :date AND post.id <= :id', {
                        date,
                        id,
                    });
                }),
            );
        }

        const posts = await postsQb.getRawMany<PostWithFile>();

        const postsWithFiles = await Promise.all(
            posts.map((post) => this.addSignedUrlsToPost(post)),
        );

        return new CursorDto(
            postsWithFiles,
            createCursorMeta(cursorOptionsDto, postsWithFiles, itemCount),
        );
    }

    async findOne(id: string, userId: string) {
        const postQb = this.makePostQueryBuilder({
            includes: ['files', 'hashtags'],
        });

        postQb.where('post.id = :id', { id });
        if (userId) postQb.andWhere('post.userId = :userId', { userId });

        const post = await postQb.getRawOne<PostWithFile>();

        return post && this.addSignedUrlsToPost(post);
    }

    async create({ description, imagesIds }: CreatePostDto, userId: string) {
        const hashtags =
            await this.hashtagsService.getHashatgsFromTextAndSave(description);

        const savedPost = await this.postsRepository.manager.transaction(
            async (manager) => {
                const newPost = manager.create(Post, {
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
        { description, imagesIds }: UpdatePostDto = {},
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

    private async addSignedUrlsToPost(
        post: PostWithFile,
    ): Promise<PostResponseDto> {
        post.cover = await this.filesService.addSignedUrlToFile(post.cover);

        if (post.files?.length) {
            const files = post.files
                .sort((a, b) => a.order - b.order)
                .map((file) => file.file);
            const filesWithUrls =
                await this.filesService.addSignedUrlsToFiles(files);

            return { ...post, files: filesWithUrls };
        }

        return post as PostResponseDto;
    }
}
