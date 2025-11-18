import {
    BadRequestException,
    Body,
    Controller,
    Delete,
    Get,
    Param,
    ParseUUIDPipe,
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

    @Get('blocked')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_BLOCKED_USERS)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_BLOCKED_USERS)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getBlockedUsers(@AuthUser() { sub: userId }: JwtUserData) {
        return this.usersService.getBlockedUsers(userId);
    }

    @Post('block/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.BLOCK_USER)
    @ApiParam(USERS_API_DOCS.PARAMS.TARGET_USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.BLOCK_USER)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_BLOCK)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async blockUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('userId', ParseUUIDPipe) targetUserId: string,
    ) {
        return this.usersService.blockUser(userId, targetUserId);
    }

    @Delete('unblock/:userId')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.UNBLOCK_USER)
    @ApiParam(USERS_API_DOCS.PARAMS.TARGET_USER_ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.UNBLOCK_USER)
    @ApiResponse(USERS_API_DOCS.RESPONSES.BAD_REQUEST_UNBLOCK)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async unblockUser(
        @AuthUser() { sub: userId }: JwtUserData,
        @Param('userId', ParseUUIDPipe) targetUserId: string,
    ) {
        return this.usersService.unblockUser(userId, targetUserId);
    }

    @Get('public/me')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_MY_PUBLIC_PROFILE)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_MY_PUBLIC_PROFILE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    @ApiResponse(USERS_API_DOCS.RESPONSES.UNAUTHORIZED)
    async getMyPublicProfile(@AuthUser() { sub: id }: JwtUserData) {
        return this.usersService.getMyPublicProfile(id);
    }

    @Get('public/:id')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.GET_PUBLIC_PROFILE)
    @ApiParam(USERS_API_DOCS.PARAMS.ID)
    @ApiOkResponse(USERS_API_DOCS.RESPONSES.GET_PUBLIC_PROFILE)
    @ApiResponse(USERS_API_DOCS.RESPONSES.NOT_FOUND)
    async getPublicProfile(
        @Param('id', ParseUUIDPipe) id: string,
        @AuthUser() { sub: viewerId }: JwtUserData,
    ) {
        return this.usersService.getPublicProfile(id, viewerId);
    }

    @Delete('me')
    @ApiOperation(USERS_API_DOCS.OPERATIONS.DELETE_ME)
    @ApiBody(USERS_BODIES.DELETE)
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

        return this.usersService.deleteUser(id);
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
