import { Body, Controller, Get, Patch, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';

import { UsersService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { UpdateUserDto } from '../dto';
import { User } from '../../database/entities';

@Controller()
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Получение данных об авторизованном пользователе',
    })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @UseGuards(JwtGuard)
    @Get('me')
    async getMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.getUserById(id);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Обновление пользователем своего профиля' })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @UseGuards(JwtGuard)
    @Patch('me')
    async updateMe(
        @AuthUser() { sub: id }: JwtUserData,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUserById(id, updateUserDto);
    }
}
