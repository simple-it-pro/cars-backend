import {
    Body,
    Controller,
    Get,
    Patch,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiBody,
    ApiOkResponse,
    ApiOperation,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';

import { UsersService } from '../services';
import { JwtGuard } from '../../auth/guards';
import { AuthUser } from '../../auth/decorators';
import { JwtUserData } from '../types';
import { UpdateUserDto } from '../dto';
import { USERS_API_DOCS, USERS_BODIES } from '../swagger/users.swagger';

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
}
