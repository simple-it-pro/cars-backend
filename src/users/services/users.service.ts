import {
    BadRequestException,
    Injectable,
    NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import * as cities from '../../common/constants/json/russian-cities.json';
import { User } from '../../database/entities';
import { UpdateUserDto } from '../dto';
import { ERROR_MESSAGES } from '../../common/constants/messages';
import { FileUrlsService } from '../../storage/services';

@Injectable()
export class UsersService {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
        private readonly fileUrlsService: FileUrlsService,
    ) {}

    async getUserById(id: string): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id },
            withDeleted: false,
        });

        if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

        return this.fileUrlsService.addSignedUrlsDeep(user);
    }

    async updateUserById(
        id: string,
        updateUserDto: UpdateUserDto,
    ): Promise<User> {
        const user = await this.usersRepository.findOne({
            where: { id, deletedAt: IsNull() },
        });

        if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

        if (updateUserDto.nickname) {
            const userWithSameNickname = await this.usersRepository.findOne({
                where: { nickname: updateUserDto.nickname },
            });

            if (userWithSameNickname && userWithSameNickname.id !== user.id)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.NICKNAME_DUPLICATE,
                );
        }

        if (updateUserDto.email) {
            const userWithSameEmail = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });

            if (userWithSameEmail && userWithSameEmail.id !== user.id)
                throw new BadRequestException(
                    ERROR_MESSAGES.USER.EMAIL_DUPLICATE,
                );
        }

        if (updateUserDto.phone) {
            const userWithSamePhone = await this.usersRepository.findOne({
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

        this.usersRepository.merge(user, updateUserDto);

        const updatedUser = await this.usersRepository.save(user);
        return instanceToPlain(updatedUser) as User;
    }

    async getAll() {
        return this.usersRepository.find({
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
