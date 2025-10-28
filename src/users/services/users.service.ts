import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';

import { User } from '../../database/entities';
import { UpdateUserDto } from '../dto';
import { ERROR_MESSAGES } from '../../common/constants/messages';
import { StorageService } from '../../storage/services';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
        private readonly storageService: StorageService,
    ) {}

    async getUserById(id: number): Promise<User | null> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);
        }

        return instanceToPlain(user) as User;
    }

    async updateUserById(
        id: number,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.userRepository.findOne({ where: { id } });

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

        this.userRepository.merge(user, updateUserDto);

        const updatedUser = await this.userRepository.save(user);
        return instanceToPlain(updatedUser) as User;
    }

    async updateAvatar(id: number, image: Express.Multer.File) {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (user.image) await this.storageService.deleteFile(user.image.url);

        const url = await this.storageService.uploadFile(image);
        user.image = { url, size: image.size, name: image.originalname };

        const savedUser = await this.userRepository.save(user);
        return instanceToPlain(savedUser) as User;
    }
}
