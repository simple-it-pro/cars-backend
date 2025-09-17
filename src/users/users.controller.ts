import { Controller, Get, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtGuard } from '../guard/jwt.guard';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from './types';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение данных об авторизованном пользователе' })
  @ApiResponse({
    status: 200,
    type: User,
  })
  @UseGuards(JwtGuard)
  @Get('me')
  async getOwnUser(@AuthUser() { sub }: JwtUserData) {
    return this.usersService.getUserById(sub);
  }
}
