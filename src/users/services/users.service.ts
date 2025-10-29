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

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly userRepository: Repository<User>,
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
}
