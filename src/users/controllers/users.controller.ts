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
    ApiTags,
    ApiParam,
    ApiOkResponse,
} from '@nestjs/swagger';

import { UsersService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { UpdateUserDto } from '../dto';
import { User, Follower, Subscription } from '../../database/entities';
import { USERS_BODIES } from '../users.swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiOperation({
        summary: 'Получение данных авторизованного пользователя',
        description:
            'Возвращает полную информацию о текущем авторизованном пользователе',
    })
    @ApiOkResponse({
        description: 'Данные пользователя успешно получены',
        type: User,
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async getMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.getUserById(id);
    }

    @Patch('me')
    @ApiOperation({
        summary: 'Обновление профиля пользователя',
        description:
            'Позволяет пользователю обновить информацию о своем профиле',
    })
    @ApiBody(USERS_BODIES.UPDATE_ME)
    @ApiOkResponse({
        description: 'Профиль успешно обновлен',
        type: User,
    })
    @ApiResponse({
        status: 400,
        description: 'Неверные данные или дублирование email/nickname/phone',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async updateMe(
        @AuthUser() { sub: id }: JwtUserData,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUserById(id, updateUserDto);
    }

    @Get('getAll')
    @ApiOperation({
        summary: 'Получение списка всех пользователей',
        description:
            'Возвращает список всех зарегистрированных пользователей (без чувствительных данных)',
    })
    @ApiOkResponse({
        description: 'Список пользователей успешно получен',
        type: User,
        isArray: true,
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async getAll() {
        return this.usersService.getAll();
    }

    @Patch('me/avatar')
    @ApiOperation({
        summary: 'Обновление аватара пользователя',
        description: 'Позволяет пользователю загрузить новый аватар',
    })
    @ApiConsumes('multipart/form-data')
    @ApiBody(USERS_BODIES.UPDATE_AVATAR)
    @ApiOkResponse({
        description: 'Аватар успешно обновлен',
        type: User,
    })
    @ApiResponse({
        status: 400,
        description: 'Файл не предоставлен или имеет недопустимый формат',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    @UseInterceptors(FileInterceptor('image'))
    async updateAvatar(
        @AuthUser() { sub: id }: JwtUserData,
        @UploadedFile() image: Express.Multer.File,
    ) {
        return this.usersService.updateAvatar(id, image);
    }

    @Post('subscribe')
    @ApiOperation({
        summary: 'Подписка на пользователя',
        description:
            'Позволяет текущему пользователю подписаться на другого пользователя',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                targetUserId: {
                    type: 'number',
                    example: 2,
                    description:
                        'ID пользователя, на которого нужно подписаться',
                },
            },
            required: ['targetUserId'],
        },
    })
    @ApiOkResponse({
        description: 'Подписка успешно оформлена',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Вы успешно подписались на пользователя.',
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Пользователь не найден или уже подписан',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.subscribeUser(userId, targetUserId);
        return { message: 'Вы успешно подписались на пользователя.' };
    }

    @Delete('unsubscribe')
    @ApiOperation({
        summary: 'Отписка от пользователя',
        description:
            'Позволяет текущему пользователю отписаться от другого пользователя',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                targetUserId: {
                    type: 'number',
                    example: 2,
                    description:
                        'ID пользователя, от которого нужно отписаться',
                },
            },
            required: ['targetUserId'],
        },
    })
    @ApiOkResponse({
        description: 'Отписка выполнена успешно',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Вы успешно отписались от пользователя.',
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Пользователь не найден или не подписан',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.unsubscribeUser(userId, targetUserId);
        return { message: 'Вы успешно отписались от пользователя.' };
    }

    @Get('subscriptions/:userId')
    @ApiOperation({
        summary: 'Получение подписок пользователя',
        description:
            'Возвращает список пользователей, на которых подписан указанный пользователь',
    })
    @ApiParam({
        name: 'userId',
        type: Number,
        description: 'ID пользователя',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Список подписок успешно получен',
        type: Subscription,
        isArray: true,
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async getUserSubscriptions(@Param('userId') userId: number) {
        return this.usersService.getSubscriptions(userId);
    }

    @Get('followers/:userId')
    @ApiOperation({
        summary: 'Получение подписчиков пользователя',
        description:
            'Возвращает список пользователей, которые подписаны на указанного пользователя',
    })
    @ApiParam({
        name: 'userId',
        type: Number,
        description: 'ID пользователя',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Список подписчиков успешно получен',
        type: Follower,
        isArray: true,
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    async getUserFollowers(@Param('userId') userId: number) {
        return this.usersService.getFollowers(userId);
    }

    @Get('public/:id')
    @ApiOperation({
        summary: 'Получение публичного профиля пользователя',
        description:
            'Возвращает публичную информацию о пользователе (без email и других приватных данных)',
    })
    @ApiParam({
        name: 'id',
        type: Number,
        description: 'ID пользователя',
        example: 1,
    })
    @ApiOkResponse({
        description: 'Публичный профиль успешно получен',
        type: User,
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
    })
    async getPublicProfile(@Param('id') id: number) {
        return this.usersService.getPublicProfile(id);
    }

    @Delete('me')
    @ApiOperation({
        summary: 'Удаление профиля (soft delete)',
        description:
            'Удаляет профиль пользователя с возможностью восстановления. Требует подтверждения.',
    })
    @ApiBody({
        schema: {
            type: 'object',
            properties: {
                confirmation: {
                    type: 'string',
                    example: 'DELETE_MY_ACCOUNT',
                    description: 'Строка подтверждения удаления аккаунта',
                },
            },
            required: ['confirmation'],
        },
    })
    @ApiOkResponse({
        description: 'Профиль успешно удален',
        schema: {
            type: 'object',
            properties: {
                message: {
                    type: 'string',
                    example: 'Профиль успешно удален.',
                },
            },
        },
    })
    @ApiResponse({
        status: 400,
        description: 'Неверное подтверждение удаления',
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
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
    @ApiOperation({
        summary: 'Деактивация профиля',
        description:
            'Временно деактивирует профиль пользователя. Пользователь не будет отображаться в поиске, но данные сохраняются.',
    })
    @ApiOkResponse({
        description: 'Профиль успешно деактивирован',
        type: User,
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
    })
    async deactivateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.deactivateUser(id);
    }

    @Post('me/activate')
    @ApiOperation({
        summary: 'Активация профиля',
        description: 'Активирует ранее деактивированный профиль пользователя',
    })
    @ApiOkResponse({
        description: 'Профиль успешно активирован',
        type: User,
    })
    @ApiResponse({
        status: 401,
        description: 'Пользователь не авторизован',
    })
    @ApiResponse({
        status: 404,
        description: 'Пользователь не найден',
    })
    async activateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.activateUser(id);
    }
}
