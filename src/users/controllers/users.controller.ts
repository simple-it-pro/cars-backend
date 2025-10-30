import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    Patch,
    Post,
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
import { User, Follower, Subscription } from '../../database/entities';
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

    @ApiOperation({
        summary: 'Подписка на пользователя',
    })
    @ApiResponse({
        status: 200,
        description: 'Вы успешно подписались на пользователя.',
    })
    @Post('subscribe')
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.subscribeUser(userId, targetUserId);
        return { message: 'Вы успешно подписались на пользователя.' };
    }

    @ApiOperation({
        summary: 'Отписка от пользователя',
    })
    @ApiResponse({
        status: 200,
        description: 'Вы успешно отписались от пользователя.',
    })
    @Delete('unsubscribe')
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.unsubscribeUser(userId, targetUserId);
        return { message: 'Вы успешно отписались от пользователя.' };
    }

    @ApiOperation({ summary: 'Получение подписок пользователя' })
    @ApiResponse({
        status: 200,
        type: Subscription,
        isArray: true,
    })
    @Get('subscriptions/:userId')
    async getUserSubscriptions(@Param('userId') userId: number) {
        return this.usersService.getSubscriptions(userId);
    }

    @ApiOperation({ summary: 'Получение подписчиков пользователя' })
    @ApiResponse({
        status: 200,
        type: Follower,
        isArray: true,
    })
    @Get('followers/:userId')
    async getUserFollowers(@Param('userId') userId: number) {
        return this.usersService.getFollowers(userId);
    }

    @ApiOperation({ summary: 'Получить публичный профиль пользователя' })
    @ApiResponse({
        status: 200,
        type: User,
    })
    @Get('public/:id')
    async getPublicProfile(@Param('id') id: number) {
        return this.usersService.getPublicProfile(id);
    }

    @Delete('me')
    @ApiOperation({ summary: 'Удаление профиля (soft delete)' })
    @ApiResponse({
        status: 200,
        description: 'Профиль успешно удален.',
    })
    async deleteMe(
        @AuthUser() { sub: id }: JwtUserData,
        @Body('confirmation') confirmation: string,
    ) {
        if (confirmation !== 'DELETE_MY_ACCOUNT') {
            throw new BadRequestException('Неверное подтверждение удаления');
        }

        await this.usersService.deleteUser(id);
        return { message: 'Профиль успешно удален.' };
    }

    @Post('me/deactivate')
    @ApiOperation({ summary: 'Деактивация профиля' })
    @ApiResponse({
        status: 200,
        type: User,
    })
    async deactivateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.deactivateUser(id);
    }

    @Post('me/activate')
    @ApiOperation({ summary: 'Активация профиля' })
    @ApiResponse({
        status: 200,
        type: User,
    })
    async activateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.activateUser(id);
    }
}
