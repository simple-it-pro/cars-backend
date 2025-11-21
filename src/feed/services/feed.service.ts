import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Brackets, Repository } from 'typeorm';

import { Subscription, UserBlock } from '../../database/entities';
import { PostStatusEnum } from '../../database/enums';
import {
    createCursorMeta,
    CursorDto,
    CursorOptionsDto,
} from '../../shared/pagination/cursor';
import { PostResponseDto } from '../../posts/dto/responses';
import { PostsService } from '../../posts/services';
import { FeedTypeEnum } from '../enums';
import { PostWithFile } from '../../posts/types';
import { Order } from '../../shared/pagination/enums';

@Injectable()
export class FeedService {
    constructor(
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        private readonly postsService: PostsService,
    ) {}

    async getFeedItems(
        cursorOptionsDto: CursorOptionsDto,
        userId: string,
        feedType: FeedTypeEnum = FeedTypeEnum.ALL,
    ): Promise<CursorDto<PostResponseDto>> {
        const blockedUserIds = await this.getBlockedUserIds(userId);

        const postsQb = this.postsService.makePostQueryBuilder({
            includes: ['files', 'hashtags'],
        });

        postsQb.where('post.status = :status', {
            status: PostStatusEnum.PUBLISHED,
        });

        if (blockedUserIds.length > 0) {
            postsQb.andWhere('post."userId" NOT IN (:...blockedUserIds)', {
                blockedUserIds,
            });
        }

        if (feedType === FeedTypeEnum.SUBSCRIPTIONS) {
            const subscriptionIds = await this.getSubscriptionIds(userId);

            if (subscriptionIds.length === 0) {
                return new CursorDto(
                    [],
                    createCursorMeta(cursorOptionsDto, [], 0),
                );
            }

            postsQb.andWhere('post."userId" IN (:...subscriptionIds)', {
                subscriptionIds,
            });
        }

        postsQb
            .orderBy('post."createdAt"', cursorOptionsDto.order)
            .addOrderBy('post.id', cursorOptionsDto.order)
            .limit(cursorOptionsDto.take);

        const itemCount = await postsQb.getCount();

        if (cursorOptionsDto.parsedCursor) {
            const { date, id } = cursorOptionsDto.parsedCursor;

            postsQb.andWhere(
                new Brackets((qb) => {
                    if (cursorOptionsDto.order === Order.DESC) {
                        qb.where('post."createdAt" < :date', { date });
                        qb.orWhere(
                            'post."createdAt" = :date AND post.id < :id',
                            {
                                date,
                                id,
                            },
                        );
                    } else {
                        qb.where('post."createdAt" > :date', { date });
                        qb.orWhere(
                            'post."createdAt" = :date AND post.id > :id',
                            {
                                date,
                                id,
                            },
                        );
                    }
                }),
            );
        }

        const posts = await postsQb.getRawMany();

        const postsWithFiles = await Promise.all(
            posts.map((post: PostWithFile) =>
                this.postsService.addSignedUrlsToPost(post),
            ),
        );

        return new CursorDto(
            postsWithFiles,
            createCursorMeta(cursorOptionsDto, postsWithFiles, itemCount),
        );
    }

    private async getBlockedUserIds(userId: string): Promise<string[]> {
        const [blockedByMe, blockedMe] = await Promise.all([
            this.userBlockRepository.find({
                where: { user: { id: userId } },
                select: ['blockedUser'],
                relations: ['blockedUser'],
            }),
            this.userBlockRepository.find({
                where: { blockedUser: { id: userId } },
                select: ['user'],
                relations: ['user'],
            }),
        ]);

        const blockedUserIds = new Set<string>();

        blockedByMe.forEach((block) => {
            if (block.blockedUser?.id) blockedUserIds.add(block.blockedUser.id);
        });

        blockedMe.forEach((block) => {
            if (block.user?.id) blockedUserIds.add(block.user.id);
        });

        return Array.from(blockedUserIds);
    }

    private async getSubscriptionIds(userId: string): Promise<string[]> {
        const subscriptions = await this.subscriptionRepository.find({
            where: { user: { id: userId } },
            select: ['subscribedUser'],
            relations: ['subscribedUser'],
        });

        return subscriptions
            .map((subscription) => subscription.subscribedUser?.id)
            .filter((userId): userId is string => Boolean(userId));
    }
}
