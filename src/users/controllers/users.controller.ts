import {
    Body,
    Controller,
    Get,
    Patch,
    UploadedFile,
    UseGuards,
    UseInterceptors,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiConsumes,
    ApiOperation,
    ApiResponse,
} from '@nestjs/swagger';

import { UsersService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { UpdateUserDto } from '../dto';
import { User } from '../../database/entities';
import { USERS_BODIES } from '../users.swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @ApiOperation({
        summary: 'Получение данных об авторизованном пользователе',
    })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @Get('me')
    async getMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.getUserById(id);
    }

    @ApiOperation({ summary: 'Обновление пользователем своего профиля' })
    @ApiBody(USERS_BODIES.UPDATE_ME)
    @ApiResponse({
        status: 200,
        type: User,
    })
    @Patch('me')
    async updateMe(
        @AuthUser() { sub: id }: JwtUserData,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUserById(id, updateUserDto);
    }

    @ApiBearerAuth('JWT-auth')
    @ApiOperation({
        summary: 'Получение пользователей',
    })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @Get('getAll')
    async getAll() {
        return this.usersService.getAll();
    }

    @ApiOperation({ summary: 'Обновление аватара' })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @ApiBody(USERS_BODIES.UPDATE_AVATAR)
    @Patch('me/avatar')
    @ApiConsumes('multipart/form-data')
    @UseInterceptors(FileInterceptor('image'))
    async updateAvatar(
        @AuthUser() { sub: id }: JwtUserData,
        @UploadedFile() image: Express.Multer.File,
    ) {
        return this.usersService.updateAvatar(id, image);
    }
}
