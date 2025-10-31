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
    ApiOkResponse,
    ApiOperation,
    ApiParam,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { UsersService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { UpdateUserDto } from '../dto';
import { USERS_API_DOCS, USERS_BODIES } from '../users.swagger';
import { FileInterceptor } from '@nestjs/platform-express';

@ApiTags('Users')
@Controller()
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtGuard)
export class UsersController {
    constructor(private readonly usersService: UsersService) {}

    @Get('me')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_ME)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_ME)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.getUserById(id);
    }

    @Patch('me')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.UPDATE_ME)
    @ApiBody(USERS_BODIES.UPDATE_ME)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.UPDATE_ME)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_UPDATE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async updateMe(
        @AuthUser() { sub: id }: JwtUserData,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        return this.usersService.updateUserById(id, updateUserDto);
    }

    @Get('getAll')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_ALL)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_ALL)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getAll() {
        return this.usersService.getAll();
    }

    @Patch('me/avatar')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.UPDATE_AVATAR)
    @ApiConsumes('multipart/form-data')
    @ApiBody(USERS_BODIES.UPDATE_AVATAR)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.UPDATE_AVATAR)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_AVATAR)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @UseInterceptors(FileInterceptor('image'))
    async updateAvatar(
        @AuthUser() { sub: id }: JwtUserData,
        @UploadedFile() image: Express.Multer.File,
    ) {
        return this.usersService.updateAvatar(id, image);
    }

    @Post('subscribe')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.SUBSCRIBE)
    @ApiBody(USERS_API_DOCS.BODIES.SUBSCRIBE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.SUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_SUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async subscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.subscribeUser(userId, targetUserId);
        return { message: 'Вы успешно подписались на пользователя.' };
    }

    @Delete('unsubscribe')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.UNSUBSCRIBE)
    @ApiBody(USERS_API_DOCS.BODIES.UNSUBSCRIBE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.UNSUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_UNSUBSCRIBE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async unsubscribeUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Body('targetUserId') targetUserId: number,
    ) {
        await this.usersService.unsubscribeUser(userId, targetUserId);
        return { message: 'Вы успешно отписались от пользователя.' };
    }

    @Get('subscriptions/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_SUBSCRIPTIONS)
    @ApiParam(USERS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_SUBSCRIPTIONS)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUserSubscriptions(@Param('userId') userId: number) {
        return this.usersService.getSubscriptions(userId);
    }

    @Get('followers/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_FOLLOWERS)
    @ApiParam(USERS_API_DOCS.PARAMS.USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_FOLLOWERS)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getUserFollowers(@Param('userId') userId: number) {
        return this.usersService.getFollowers(userId);
    }

    @Get('public/:id')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_PUBLIC_PROFILE)
    @ApiParam(USERS_API_DOCS.PARAMS.ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_PUBLIC_PROFILE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    async getPublicProfile(@Param('id') id: number) {
        return this.usersService.getPublicProfile(id);
    }

    @Delete('me')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.DELETE_ME)
    @ApiBody(USERS_API_DOCS.BODIES.DELETE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.DELETE_ME)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_DELETE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
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
    @ApiOperation(USERS_API_DOCS.OPERATIONS.DEACTIVATE_ME)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.DEACTIVATE_ME)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    async deactivateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.deactivateUser(id);
    }

    @Post('me/activate')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.ACTIVATE_ME)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.ACTIVATE_ME)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    async activateMe(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.activateUser(id);
    }
}
