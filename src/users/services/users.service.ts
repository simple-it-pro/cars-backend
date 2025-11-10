import {
    BadRequestException,
    ForbiddenException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import * as cities from '../../common/constants/json/russian-cities.json';
import {
    Follower,
    Subscription,
    User,
    UserBlock,
} from '../../database/entities';
import { UpdateUserDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
} from '../../common/constants/messages';
import { StorageService } from '../../storage/services';
import { RatingService } from './rating.service';
import { NotificationsService } from '../../notifications/services';
import { NotificationMessages, NotificationType } from '../../common/types';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Follower)
        private readonly followerRepository: Repository<Follower>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        private readonly storageService: StorageService,
        private readonly ratingService: RatingService,
        private readonly notificationsService: NotificationsService,
    ) {}

    async getUserById(id: string): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        const userWithUrl = await this.addSignedUrlToUser(user);
        return instanceToPlain(userWithUrl) as User;
    }

    async updateUserById(
        id: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });

        if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (updateUserDto.nickname) {
            const userWithSameNickname = await this.userRepository.findOne({
                where: { nickname: updateUserDto.nickname },
            });

            if (userWithSameNickname && userWithSameNickname.id !== user.id)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.NICKNAME_DUPLICATE,
                );
        }

        if (updateUserDto.email) {
            const userWithSameEmail = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (userWithSameEmail && userWithSameEmail.id !== user.id)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.EMAIL_DUPLICATE,
                );
        }

        if (updateUserDto.phone) {
            const userWithSamePhone = await this.userRepository.findOne({
                where: { phone: updateUserDto.phone },
            });

            if (userWithSamePhone && userWithSamePhone.id !== user.id)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.PHONE_DUPLICATE,
                );
        }

        if (updateUserDto.city) {
            const city = cities.find(
                (city) => city.name === updateUserDto.city,
            );
            if (!city)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.CITY_NOT_FOUND,
                );

            user.city = city.name;
        }

        this.userRepository.merge(user, updateUserDto);

        const updatedUser = await this.userRepository.save(user);
        return instanceToPlain(updatedUser) as User;
    }

    /* TODO: надо будет удалить после тестирования или сделать безопасно */
    async getAll() {
        return this.userRepository.find({
            select: {
                id: true,
                createdAt: true,
                updatedAt: true,
                login: true,
                password: false,
                phone: true,
                nickname: true,
                name: true,
                birthdate: true,
                city: true,
                email: true,
                role: true,
            },
        });
    }

    async updateAvatar(id: string, image: Express.Multer.File) {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        try {
            if (user.image)
                await this.storageService.deleteFile(user.image.url);
        } catch (error) {
            console.warn(WARNING_MESSAGES.USER.AVATAR_DELETION_FAILED, error);
        }

        try {
            const key = await this.storageService.uploadFile(image);
            user.image = {
                url: key,
                size: image.size,
                name: image.originalname,
            };

            const savedUser = await this.userRepository.save(user);
            const userWithUrl = await this.addSignedUrlToUser(savedUser);
            return instanceToPlain(userWithUrl) as User;
        } catch {
            throw new BadRequestException(ERROR_MESSAGES.AVATAR.UPLOAD_FAILED);
        }
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

    async subscribeUser(
        userId: string,
        targetUserId: string,
    ): Promise<{ message: string }> {
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

        await this.checkBlockStatus(userId, targetUserId);

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

    async getBlockedUsers(userId: string) {
        const blocks: UserBlock[] = await this.userBlockRepository.find({
            where: {
                user: { id: userId },
            },
            relations: ['blockedUser'],
        });

        return blocks.map((block: UserBlock): User => block.blockedUser);
    }

    async blockUser(userId: string, targetUserId: string) {
        const targetUser = await this.userRepository.findOne({
            where: { id: targetUserId },
        });

        if (!targetUser)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        const existingBlock = await this.userBlockRepository.findOne({
            where: {
                user: { id: userId },
                blockedUser: { id: targetUserId },
            },
        });

        if (existingBlock)
            throw new BadRequestException(ERROR_MESSAGES.USER.ALREADY_BLOCKED);

        const block = this.userBlockRepository.create({
            user: { id: userId },
            blockedUser: { id: targetUserId },
        });

        await this.userBlockRepository.save(block);

        return { message: SUCCESS_MESSAGES.USER.BLOCKED };
    }

    async unblockUser(userId: string, targetUserId: string) {
        const block = await this.userBlockRepository.findOne({
            where: {
                user: { id: userId },
                blockedUser: { id: targetUserId },
            },
        });

        if (!block)
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_BLOCKED);

        await this.userBlockRepository.remove(block);

        return { message: SUCCESS_MESSAGES.USER.UNBLOCKED };
    }

    async getPublicProfile(id: string): Promise<Partial<User>> {
        await this.ratingService.calculateAndUpdateUserRating(id);
        const user = await this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
            select: [
                'id',
                'nickname',
                'name',
                'city',
                'about',
                'image',
                'rating',
                'createdAt',
            ],
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (user.isDeactivated) {
            this.logger.warn(
                `Попытка доступа к деактивированному профилю: ${id}`,
            );
            throw new BadRequestException(
                ERROR_MESSAGES.USER.PUBLIC_PROFILE_NOT_AVAILABLE,
            );
        }

        return this.addSignedUrlToUser(user);
    }

    async getMyPublicProfile(id: string): Promise<Partial<User>> {
        await this.ratingService.calculateAndUpdateUserRating(id);
        const user = await this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
            select: [
                'id',
                'nickname',
                'name',
                'city',
                'about',
                'image',
                'rating',
                'createdAt',
            ],
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        return this.addSignedUrlToUser(user);
    }

    async generatePublicProfileLink(
        id: string,
    ): Promise<{ publicUrl: string; message: string }> {
        const user = await this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
            select: ['id', 'isDeactivated'],
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (user.isDeactivated) {
            throw new BadRequestException(
                ERROR_MESSAGES.USER.PUBLIC_PROFILE_NOT_AVAILABLE,
            );
        }

        /* TODO: заменить в последующем на deep url */
        const publicUrl = `${process.env.APP_URL || 'https://yourapp.com'}/u/${user.id}`;

        this.logger.log(
            `Сгенерирована ссылка для пользователя ${user.id}: ${publicUrl}`,
        );

        return {
            publicUrl,
            message: SUCCESS_MESSAGES.USER.PUBLIC_LINK_GENERATED,
        };
    }

    async getPublicProfileBySlug(slug: string): Promise<Partial<User>> {
        this.logger.log(`Публичный профиль получен по slug: ${slug}`);

        const user = await this.userRepository.findOne({
            where: {
                id: slug,
                deletedAt: IsNull(),
                isDeactivated: false,
            },
            select: [
                'id',
                'nickname',
                'name',
                'city',
                'about',
                'image',
                'rating',
                'createdAt',
            ],
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        await this.ratingService.calculateAndUpdateUserRating(user.id);
        return this.addSignedUrlToUser(user);
    }

    async deleteUser(id: string): Promise<{ message: string }> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        await this.userRepository.softDelete(id);

        return { message: SUCCESS_MESSAGES.USER.DELETED };
    }

    async deactivateUser(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        user.isDeactivated = true;
        return this.userRepository.save(user);
    }

    async activateUser(id: string): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        user.isDeactivated = false;
        return this.userRepository.save(user);
    }

    private async addSignedUrlToUser(user: User): Promise<User> {
        if (user.image?.url) {
            const signedUrl = await this.storageService.getFileUrl(
                user.image.url,
            );
            return {
                ...user,
                image: {
                    ...user.image,
                    url: signedUrl,
                },
            };
        }
        return user;
    }
}
