import {
    BadRequestException,
    ForbiddenException,
    Injectable,
} from '@nestjs/common';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { IsNull, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import {
    Follower,
    Subscription,
    User,
    UserBlock,
} from '../../database/entities';
import { NotificationMessages, NotificationType } from '../../common/types';
import { NotificationsService } from '../../notifications/services';

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

    async getSubscriptions(userId: string): Promise<Subscription[]> {
        return this.subscriptionRepository.find({
            where: { user: { id: userId, deletedAt: IsNull() } },
            relations: ['subscribedUser'],
        });
    }

    async getFollowers(userId: string): Promise<Follower[]> {
        return this.followerRepository.find({
            where: {
                subscribedUser: { id: userId },
            },
            relations: ['follower'],
        });
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
}
