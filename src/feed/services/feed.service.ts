import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository, SelectQueryBuilder } from 'typeorm';

import { Post, PostFile, UserBlock } from '../../database/entities';
import { PostStatusEnum } from '../../database/enums';
import {
    createCursorMeta,
    CursorDto,
    CursorOptionsDto,
    parseCompositeCursor,
} from '../../shared/pagination/cursor';
import { PostResponseDto } from '../../posts/dto/responses';
import { PostWithFile } from '../../posts/types';
import { PostsService } from '../../posts/services';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(Post)
        private readonly postsRepository: Repository<Post>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        private readonly postsService: PostsService,
    ) {}

    private makeFeedQueryBuilder(): SelectQueryBuilder<Post> {
        const postsQb = this.postsRepository
            .createQueryBuilder('post')
            .select([
                'post.id AS id',
                'post.description AS description',
                'post.status AS status',
                'post."userId" AS "userId"',
                'post."createdAt" AS "createdAt"',
                'post."updatedAt" AS "updatedAt"',
            ])
            .addSelect(
                (qb: SelectQueryBuilder<Post>) =>
                    qb
                        .subQuery()
                        .select('to_jsonb(file)')
                        .from(PostFile, 'post_file')
                        .where('post_file."postId" = post.id')
                        .orderBy('post_file."order"', 'ASC')
                        .leftJoin('post_file.file', 'file')
                        .limit(1),
                'cover',
            )
            .groupBy('post.id');

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

        postsQb
            .addSelect('jsonb_agg(hashtags)', 'hashtags')
            .leftJoin('post.hashtags', 'hashtags');

        return postsQb;
    }

    async getFeedItems(
        cursorOptionsDto: CursorOptionsDto,
        userId: string,
    ): Promise<CursorDto<PostResponseDto>> {
        const [blockedByMe, blockedMe] = await Promise.all([
            this.userBlockRepository.find({
                where: { user: { id: userId } },
                relations: ['blockedUser'],
            }),
            this.userBlockRepository.find({
                where: { blockedUser: { id: userId } },
                relations: ['user'],
            }),
        ]);

        const blockedUserIds = new Set<string>();

        for (const block of blockedByMe) {
            if (block.blockedUser?.id) {
                blockedUserIds.add(block.blockedUser.id);
            }
        }

        for (const block of blockedMe) {
            if (block.user?.id) {
                blockedUserIds.add(block.user.id);
            }
        }

        const postsQb = this.makeFeedQueryBuilder();

        postsQb.where('post.status = :status', {
            status: PostStatusEnum.PUBLISHED,
        });

        if (blockedUserIds.size > 0) {
            postsQb.andWhere('post."userId" NOT IN (:...blockedUserIds)', {
                blockedUserIds: Array.from(blockedUserIds),
            });
        }

        postsQb
            .orderBy('post."createdAt"', cursorOptionsDto.order)
            .addOrderBy('post.id', cursorOptionsDto.order)
            .limit(cursorOptionsDto.take);

        const itemCount = await postsQb.getCount();

        if (cursorOptionsDto.cursor) {
            const { date, id } = parseCompositeCursor(cursorOptionsDto.cursor);

            postsQb.andWhere(
                new Brackets((qb) => {
                    qb.where('post."createdAt" <= :date', { date });
                    qb.orWhere('post."createdAt" = :date AND post.id <= :id', {
                        date,
                        id,
                    });
                }),
            );
        }

        const posts = await postsQb.getRawMany<PostWithFile>();

        const postsWithFiles = await Promise.all(
            posts.map((post) => this.postsService.addSignedUrlsToPost(post)),
        );

        return new CursorDto(
            postsWithFiles,
            createCursorMeta(cursorOptionsDto, postsWithFiles, itemCount),
        );
    }
}
