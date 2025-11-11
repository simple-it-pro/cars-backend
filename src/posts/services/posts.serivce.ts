import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository, SelectQueryBuilder } from 'typeorm';

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

    async findAll({ includes, hashtags }: GetPostsQueryDto) {
        const postsQb = this.postsRepository.createQueryBuilder('post');

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

        if (hashtags) {
            postsQb.where(
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

        const posts = await postsQb.getMany();

        if (includes?.includes('files')) {
            const postsWithFiles = await Promise.all(
                posts.map((post) => this.addSignedUrlsToPost(post)),
            );

            return postsWithFiles;
        }

        return posts;
    }

    async findOne(id: string) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['files', 'files.file', 'hashtags'],
        });

        return post && this.addSignedUrlsToPost(post);
    }

    async create(
        { title, description, imagesIds }: CreatePostDto,
        userId: number,
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
                        'Загруженные файлы не найдены или уже используются в другом посте',
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

        return this.findOne(savedPost.id);
    }

    // TODO: Remove dublicates from imagesIds array
    async update(
        id: string,
        { title, description, imagesIds }: UpdatePostDto = {},
    ) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['files', 'files.file'],
        });
        if (!post) throw new NotFoundException('Пост не найден');

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
                        'Загруженные файлы не найдены или уже используются в другом посте',
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

        return this.findOne(id);
    }

    async delete(id: string) {
        const post = await this.postsRepository.findOne({
            where: { id },
            relations: ['files', 'files.file'],
        });
        if (!post) return 'Success';

        await this.postsRepository.manager.transaction(async (manager) => {
            await manager.delete(Post, id);
            await manager.update(
                FileEntity,
                post.files.map((file) => file.file.id),
                { status: FileStatusEnum.TEMPORARY },
            );
        });

        return 'Success';
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
