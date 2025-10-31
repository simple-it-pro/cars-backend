import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import * as cities from '../../common/constants/json/russian-cities.json';
import { User, Follower, Subscription } from '../../database/entities';
import { UpdateUserDto } from '../dto';
import {
    ERROR_MESSAGES,
    WARNING_MESSAGES,
} from '../../common/constants/messages';
import { StorageService } from '../../storage/services';
import { RatingService } from './rating.service';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly storageService: StorageService,
        @InjectRepository(Subscription)
        private readonly subscriptionRepository: Repository<Subscription>,
        @InjectRepository(Follower)
        private readonly followerRepository: Repository<Follower>,
        private readonly ratingService: RatingService,
    ) {}

    async getUserById(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        const userWithUrl = await this.addSignedUrlToUser(user);
        return instanceToPlain(userWithUrl) as User;
    }

    async updateUserById(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });

        if (!user) {
            throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        if (updateUserDto.nickname) {
            const userWithSameNickname = await this.userRepository.findOne({
                where: { nickname: updateUserDto.nickname },
            });

            if (userWithSameNickname && userWithSameNickname.id !== user.id) {
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.NICKNAME_DUPLICATE,
                );
            }
        }

        if (updateUserDto.email) {
            const userWithSameEmail = await this.userRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (userWithSameEmail && userWithSameEmail.id !== user.id) {
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.EMAIL_DUPLICATE,
                );
            }
        }

        if (updateUserDto.phone) {
            const userWithSamePhone = await this.userRepository.findOne({
                where: { phone: updateUserDto.phone },
            });

            if (userWithSamePhone && userWithSamePhone.id !== user.id) {
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.PHONE_DUPLICATE,
                );
            }
        }

        if (updateUserDto.city) {
            const city = cities.find(
                (city) => city.name === updateUserDto.city,
            );
            if (!city) {
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.CITY_NOT_FOUND,
                );
            }
            user.city = city.name;
        }

        this.userRepository.merge(user, updateUserDto);

        const updatedUser = await this.userRepository.save(user);
        return instanceToPlain(updatedUser) as User;
    }

    /* надо будет удалить после тестирования или сделать безопасно */
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

    async updateAvatar(id: number, image: Express.Multer.File) {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        try {
            if (user.image) {
                await this.storageService.deleteFile(user.image.url);
            }
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
        } catch (error) {
            throw new BadRequestException(ERROR_MESSAGES.AVATAR.UPLOAD_FAILED);
        }
    }

    async subscribeUser(userId: number, targetUserId: number): Promise<void> {
        if (userId === targetUserId)
            throw new BadRequestException(
                ERROR_MESSAGES.SUBSCRIPTION.SELF_SUBSCRIBE,
            );

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
    }

    async unsubscribeUser(userId: number, targetUserId: number): Promise<void> {
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

        if (follower) {
            await this.followerRepository.remove(follower);
        }
    }

    async getSubscriptions(userId: number): Promise<Subscription[]> {
        return this.subscriptionRepository.find({
            where: { user: { id: userId, deletedAt: IsNull() } },
            relations: ['subscribedUser'],
        });
    }

    async getFollowers(userId: number): Promise<Follower[]> {
        return this.followerRepository.find({
            where: {
                subscribedUser: { id: userId },
            },
            relations: ['follower'],
        });
    }

    async getPublicProfile(id: number): Promise<Partial<User>> {
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

    async deleteUser(id: number): Promise<void> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        await this.userRepository.softDelete(id);
    }

    async deactivateUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        user.isDeactivated = true;
        return this.userRepository.save(user);
    }

    async activateUser(id: number): Promise<User> {
        const user = await this.userRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

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
