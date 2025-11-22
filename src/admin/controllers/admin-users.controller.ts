import {
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
    Patch,
    Post,
    Query,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { InjectRepository } from '@nestjs/typeorm';
import { ILike, Repository } from 'typeorm';

import { JwtGuard, AdminGuard } from '../../auth/guards';
import { User } from '../../database/entities';
import { CreateUserDto, AdminUpdateUserDto, GetUsersFilterDto } from '../dto';
import { UserRole } from '../../common/types';

@ApiTags('Admin - Users')
@Controller('admin/users')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard, AdminGuard)
export class AdminUsersController {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    @Get()
    @ApiOperation({ summary: 'Получить всех пользователей' })
    @ApiQuery({ name: 'name', required: false, description: 'Фильтр по имени' })
    @ApiResponse({ status: 200, description: 'Список пользователей' })
    async getAll(@Query() filter: GetUsersFilterDto) {
        const where: Record<string, unknown> = {};

        if (filter.name) {
            where.name = ILike(`%${filter.name}%`);
        }

        return this.usersRepository.find({
            where,
            order: { createdAt: 'DESC' },
        });
    }

    @Get(':id')
    @ApiOperation({ summary: 'Получить пользователя по ID' })
    @ApiResponse({ status: 200, description: 'Пользователь' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async getById(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        return user;
    }

    @Post()
    @ApiOperation({ summary: 'Создать пользователя' })
    @ApiResponse({ status: 201, description: 'Пользователь создан' })
    @ApiResponse({ status: 400, description: 'Некорректные данные' })
    async create(@Body() createUserDto: CreateUserDto) {
        const existingUser = await this.usersRepository.findOne({
            where: { phone: createUserDto.phone },
        });

        if (existingUser) {
            throw new Error('Пользователь с таким телефоном уже существует');
        }

        if (createUserDto.nickname) {
            const nicknameExists = await this.usersRepository.findOne({
                where: { nickname: createUserDto.nickname },
            });
            if (nicknameExists) {
                throw new Error('Никнейм уже занят');
            }
        }

        if (createUserDto.email) {
            const emailExists = await this.usersRepository.findOne({
                where: { email: createUserDto.email },
            });
            if (emailExists) {
                throw new Error('Email уже занят');
            }
        }

        const user = this.usersRepository.create({
            ...createUserDto,
            role: createUserDto.role || UserRole.COMMON,
        });

        return this.usersRepository.save(user);
    }

    @Patch(':id')
    @ApiOperation({ summary: 'Обновить пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь обновлен' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async update(
        @Param('id', ParseUUIDPipe) id: string,
        @Body() updateUserDto: AdminUpdateUserDto,
    ) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('Пользователь не найден');
        }

        if (updateUserDto.phone && updateUserDto.phone !== user.phone) {
            const phoneExists = await this.usersRepository.findOne({
                where: { phone: updateUserDto.phone },
            });
            if (phoneExists) {
                throw new Error('Телефон уже занят');
            }
        }

        if (updateUserDto.nickname && updateUserDto.nickname !== user.nickname) {
            const nicknameExists = await this.usersRepository.findOne({
                where: { nickname: updateUserDto.nickname },
            });
            if (nicknameExists) {
                throw new Error('Никнейм уже занят');
            }
        }

        if (updateUserDto.email && updateUserDto.email !== user.email) {
            const emailExists = await this.usersRepository.findOne({
                where: { email: updateUserDto.email },
            });
            if (emailExists) {
                throw new Error('Email уже занят');
            }
        }

        this.usersRepository.merge(user, updateUserDto);
        return this.usersRepository.save(user);
    }

    @Delete(':id')
    @ApiOperation({ summary: 'Удалить пользователя' })
    @ApiResponse({ status: 200, description: 'Пользователь удален' })
    @ApiResponse({ status: 404, description: 'Пользователь не найден' })
    async delete(@Param('id', ParseUUIDPipe) id: string) {
        const user = await this.usersRepository.findOne({ where: { id } });
        if (!user) {
            throw new Error('Пользователь не найден');
        }
        await this.usersRepository.softRemove(user);
        return { message: 'Пользователь удален' };
    }
}
