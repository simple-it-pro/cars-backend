import {
    BadRequestException,
    Injectable,
    Logger,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import * as cities from '../../common/constants/json/russian-cities.json';
import { Review, User, UserBlock } from '../../database/entities';
import { UpdateUserDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
    WARNING_MESSAGES,
} from '../../common/constants/messages';
import { FileUrlsService, StorageService } from '../../storage/services';
import { RatingService } from './rating.service';
import { SubscriptionsService } from './subscriptions.service';
import { UserWithCounters } from '../types/user-with-counters';
import { UserProfile } from '../types/user-profile';

@Injectable()
export class UsersService {
    private readonly logger = new Logger(UsersService.name);
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        @InjectRepository(UserBlock)
        private readonly userBlockRepository: Repository<UserBlock>,
        @InjectRepository(Review)
        private readonly reviewRepository: Repository<Review>,
        private readonly storageService: StorageService,
        private readonly ratingService: RatingService,
        private readonly subscriptionsService: SubscriptionsService,
        private readonly fileUrlsService: FileUrlsService,
    ) {}

    async getUserById(id: string): Promise<UserWithCounters> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        const userWithUrl = await this.fileUrlsService.addSignedUrlsDeep(user);
        const counters = await this.getUserCounters(id);

        return { ...userWithUrl, counters };
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
            const userWithUrl =
                await this.fileUrlsService.addSignedUrlsDeep(savedUser);
            return instanceToPlain(userWithUrl) as User;
        } catch {
            throw new BadRequestException(ERROR_MESSAGES.AVATAR.UPLOAD_FAILED);
        }
    }

    async getBlockedUsers(userId: string): Promise<Partial<User>[]> {
        const blocks = await this.userBlockRepository.find({
            where: { user: { id: userId } },
            relations: ['blockedUser'],
        });

        const result: Partial<User>[] = [];

        for (const b of blocks) {
            const u = await this.fileUrlsService.addSignedUrlsDeep(
                b.blockedUser,
            );
            result.push({
                id: u.id,
                nickname: u.nickname ?? null,
                name: u.name ?? null,
                image: u.image ?? null,
            });
        }

        return result;
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

    async getPublicProfile(id: string, viewerId: string): Promise<UserProfile> {
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
                'isDeactivated',
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

        const [isBlocked, isSubscribed, userWithImageUrl, counters] =
            await Promise.all([
                this.userBlockRepository.exists({
                    where: [
                        { user: { id: viewerId }, blockedUser: { id } },
                        { user: { id }, blockedUser: { id: viewerId } },
                    ],
                }),
                this.subscriptionsService.getIsSubscribed(viewerId, id),
                this.fileUrlsService.addSignedUrlsDeep(user),
                this.getUserCounters(id),
            ]);

        return {
            ...userWithImageUrl,
            isBlocked,
            isSubscribed,
            counters,
        };
    }

    async getMyPublicProfile(id: string): Promise<UserWithCounters> {
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

        const userWithImageUrl =
            await this.fileUrlsService.addSignedUrlsDeep(user);
        const counters = await this.getUserCounters(id);

        return {
            ...userWithImageUrl,
            counters,
        };
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

    private async getUserCounters(id: string) {
        const [subscriptionsCount, followersCount, reviewsCount] =
            await Promise.all([
                this.subscriptionsService.getSubscriptionsCounter(id),
                this.subscriptionsService.getFollowersCounter(id),
                this.reviewRepository.count({ where: { user: { id } } }),
            ]);

        return {
            subscriptionsCount,
            followersCount,
            reviewsCount,
        };
    }
}
