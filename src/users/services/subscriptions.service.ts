import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { Brackets, IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Follower,
    Subscription,
    User,
    UserBlock,
} from '../../database/entities';
import { NotificationMessages, NotificationType } from '../../common/types';
import { NotificationsService } from '../../notifications/services';
import {
    createCursorMeta,
    CursorDto,
    CursorOptionsDto,
} from '../../shared/pagination/cursor';
import { FileUrlsService } from '../../storage/services';
import { SubscriptionItemDto, SubscriptionUserDto } from '../dto/responses';
import { plainToInstance } from 'class-transformer';
import { GetSubscriptionsQueryDto } from '../dto/queries';
import { Order } from '../../shared/pagination/enums';

@Injectable()
export class SubscriptionsService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Follower)
        private readonly followerRepository: Repository<Follower>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        private readonly notificationsService: NotificationsService,
        private readonly fileUrlsService: FileUrlsService,
    ) {}

    async getSubscriptionsCounter(userId: string) {
        return this.subscriptionRepository.count({
            where: { user: { id: userId } },
        });
    }

    async getFollowersCounter(userId: string) {
        return this.followerRepository.count({
            where: { subscribedUser: { id: userId } },
        });
    }

    async subscribeUser(
        userId: string,
        targetUserId: string,
    ): Promise<{ message: string }> {
        await this.checkBlockStatus(userId, targetUserId);

        const [user, targetUser] = await Promise.all([
            this.userRepository.findOne({
                where: { id: userId, deletedAt: IsNull() },
            }),
            this.userRepository.findOne({
                where: { id: targetUserId, deletedAt: IsNull() },
            }),
        ]);

        if (!(user && targetUser))
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.USER_NOT_FOUND,
            );

        if (userId === targetUserId)
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.SELF_SUBSCRIBE,
            );

        const existingSubscription = await this.subscriptionRepository.findOne({
            where: {
                user: { id: userId },
                subscribedUser: { id: targetUserId },
            },
        });

        if (existingSubscription)
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.ALREADY_SUBSCRIBED,
            );

        const subscription = this.subscriptionRepository.create({
            user: { id: userId },
            subscribedUser: { id: targetUserId },
        });

        await this.subscriptionRepository.save(subscription);

        const follower = this.followerRepository.create({
            follower: { id: userId },
            subscribedUser: { id: targetUserId },
        });
        await this.followerRepository.save(follower);

        await this.notificationsService.create(targetUserId, {
            type: NotificationType.FOLLOW,
            title: NotificationMessages.FOLLOW,
            description: user.name
                ? `На вас подписался ${user.name}`
                : 'У вас +1 подписчик',
        });

        return { message: SUCCESS_MESSAGES.USER.SUBSCRIBED };
    }

    async unsubscribeUser(
        userId: string,
        targetUserId: string,
    ): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id: userId },
        });
        const targetUser = await this.userRepository.findOne({
            where: { id: targetUserId },
        });

        if (!user || !targetUser)
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.USER_NOT_FOUND,
            );

        const subscription = await this.subscriptionRepository.findOne({
            where: {
                user: { id: userId },
                subscribedUser: { id: targetUserId },
            },
        });

        if (!subscription)
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.NOT_SUBSCRIBED,
            );

        await this.subscriptionRepository.remove(subscription);

        const follower = await this.followerRepository.findOne({
            where: {
                follower: { id: userId },
                subscribedUser: { id: targetUserId },
            },
        });

        if (follower) await this.followerRepository.remove(follower);

        return { message: SUCCESS_MESSAGES.USER.UNSUBSCRIBED };
    }

    async getSubscriptions(
        userId: string,
        viewerId: string,
        cursorOptionsDto: CursorOptionsDto,
        queryDto: GetSubscriptionsQueryDto,
    ): Promise<CursorDto<SubscriptionItemDto>> {
        const qb = this.subscriptionRepository
            .createQueryBuilder('subscription')
            .leftJoinAndSelect('subscription.subscribedUser', 'user')
            .where('subscription.user_id = :userId', { userId })
            .andWhere('user.deletedAt IS NULL')
            .andWhere('user.isDeactivated = :isDeactivated', {
                isDeactivated: false,
            });

        if (queryDto.search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('LOWER(user.name) LIKE LOWER(:search)', {
                        search: `%${queryDto.search}%`,
                    }).orWhere('LOWER(user.nickname) LIKE LOWER(:search)', {
                        search: `%${queryDto.search}%`,
                    });
                }),
            );
        }

        qb.orderBy('subscription.createdAt', cursorOptionsDto.order)
            .addOrderBy('subscription.id', cursorOptionsDto.order)
            .take(cursorOptionsDto.take);

        const itemCount = await qb.getCount();

        if (cursorOptionsDto.parsedCursor) {
            const { date, id } = cursorOptionsDto.parsedCursor;

            qb.andWhere(
                new Brackets((qb) => {
                    if (cursorOptionsDto.order === Order.DESC) {
                        qb.where('subscription.createdAt < :date', { date });
                        qb.orWhere(
                            'subscription.createdAt = :date AND subscription.id < :id',
                            { date, id },
                        );
                    } else {
                        qb.where('subscription.createdAt > :date', { date });
                        qb.orWhere(
                            'subscription.createdAt = :date AND subscription.id > :id',
                            { date, id },
                        );
                    }
                }),
            );
        }

        const subscriptions = await qb.getMany();

        const items = await Promise.all(
            subscriptions.map(async (subscription) => {
                const userWithUrl =
                    await this.fileUrlsService.addSignedUrlsDeep(
                        subscription.subscribedUser,
                    );

                const [isSubscribed, isBlocked] = await Promise.all([
                    this.getIsSubscribed(
                        viewerId,
                        subscription.subscribedUser.id,
                    ),
                    this.userBlockRepository.exists({
                        where: [
                            {
                                user: { id: viewerId },
                                blockedUser: {
                                    id: subscription.subscribedUser.id,
                                },
                            },
                            {
                                user: { id: subscription.subscribedUser.id },
                                blockedUser: { id: viewerId },
                            },
                        ],
                    }),
                ]);

                const userDto = plainToInstance(SubscriptionUserDto, {
                    ...userWithUrl,
                    isSubscribed,
                    isBlocked,
                });

                return plainToInstance(SubscriptionItemDto, {
                    id: subscription.id,
                    createdAt: subscription.createdAt,
                    user: userDto,
                });
            }),
        );

        return new CursorDto(
            items,
            createCursorMeta(cursorOptionsDto, items, itemCount),
        );
    }

    async getFollowers(
        userId: string,
        viewerId: string,
        cursorOptionsDto: CursorOptionsDto,
        queryDto: GetSubscriptionsQueryDto,
    ): Promise<CursorDto<SubscriptionItemDto>> {
        const qb = this.followerRepository
            .createQueryBuilder('follower')
            .leftJoinAndSelect('follower.follower', 'user')
            .where('follower.subscribed_user_id = :userId', { userId })
            .andWhere('user.deletedAt IS NULL')
            .andWhere('user.isDeactivated = :isDeactivated', {
                isDeactivated: false,
            });

        if (queryDto.search) {
            qb.andWhere(
                new Brackets((qb) => {
                    qb.where('LOWER(user.name) LIKE LOWER(:search)', {
                        search: `%${queryDto.search}%`,
                    }).orWhere('LOWER(user.nickname) LIKE LOWER(:search)', {
                        search: `%${queryDto.search}%`,
                    });
                }),
            );
        }

        qb.orderBy('follower.createdAt', cursorOptionsDto.order)
            .addOrderBy('follower.id', cursorOptionsDto.order)
            .take(cursorOptionsDto.take);

        const itemCount = await qb.getCount();

        if (cursorOptionsDto.parsedCursor) {
            const { date, id } = cursorOptionsDto.parsedCursor;

            qb.andWhere(
                new Brackets((qb) => {
                    if (cursorOptionsDto.order === Order.DESC) {
                        qb.where('follower.createdAt < :date', { date });
                        qb.orWhere(
                            'follower.createdAt = :date AND follower.id < :id',
                            { date, id },
                        );
                    } else {
                        qb.where('follower.createdAt > :date', { date });
                        qb.orWhere(
                            'follower.createdAt = :date AND follower.id > :id',
                            { date, id },
                        );
                    }
                }),
            );
        }

        const followers = await qb.getMany();

        const items = await Promise.all(
            followers.map(async (follower) => {
                const userWithUrl =
                    await this.fileUrlsService.addSignedUrlsDeep(
                        follower.follower,
                    );

                const [isSubscribed, isBlocked] = await Promise.all([
                    this.getIsSubscribed(viewerId, follower.follower.id),
                    this.userBlockRepository.exists({
                        where: [
                            {
                                user: { id: viewerId },
                                blockedUser: { id: follower.follower.id },
                            },
                            {
                                user: { id: follower.follower.id },
                                blockedUser: { id: viewerId },
                            },
                        ],
                    }),
                ]);

                const userDto = plainToInstance(SubscriptionUserDto, {
                    ...userWithUrl,
                    isSubscribed,
                    isBlocked,
                });

                return plainToInstance(SubscriptionItemDto, {
                    id: follower.id,
                    createdAt: follower.createdAt,
                    user: userDto,
                });
            }),
        );

        return new CursorDto(
            items,
            createCursorMeta(cursorOptionsDto, items, itemCount),
        );
    }

    private async checkBlockStatus(userId: string, targetUserId: string) {
        const [isBlocked, isBlockedBy] = await Promise.all([
            this.userBlockRepository.findOne({
                where: {
                    user: { id: userId },
                    blockedUser: { id: targetUserId },
                },
            }),
            this.userBlockRepository.findOne({
                where: {
                    user: { id: targetUserId },
                    blockedUser: { id: userId },
                },
            }),
        ]);

        if (isBlocked)
            throw new ForbiddenException(
                ERROR_MESSAGES.SUBSCRIPTION.CANNOT_SUBSCRIBE_BLOCKED,
            );

        if (isBlockedBy)
            throw new ForbiddenException(
                ERROR_MESSAGES.SUBSCRIPTION.BLOCKED_BY_USER,
            );
    }

    async getIsSubscribed(
        userId: string,
        targetUserId: string,
    ): Promise<boolean> {
        if (userId === targetUserId) return false;

        return this.subscriptionRepository.exists({
            where: {
                user: { id: userId },
                subscribedUser: { id: targetUserId },
            },
        });
    }
}
