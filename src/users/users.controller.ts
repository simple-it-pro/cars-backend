import {
  Body,
  Controller,
  Get,
  Patch,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { UsersService } from './users.service';
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { User } from './entities/user.entity';
import { JwtGuard } from '../guard/jwt.guard';
import { AuthUser } from '../decorators/user.decorator';
import { JwtUserData } from './types';
import { UpdateUserDto } from './dto/update-user.dto';
import { FilesInterceptor } from '@nestjs/platform-express';
import { USERS_BODIES } from './users.swagger';

@Controller('users')
@UseGuards(JwtGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение данных об авторизованном пользователе' })
  @ApiResponse({
    status: 200,
    type: User,
  })
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
  @ApiBody(USERS_BODIES.UPDATE_ME)
  @Patch('me')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(FilesInterceptor('image'))
  async updateMe(
    @AuthUser() { sub: id }: JwtUserData,
    @Body() updateUserDto: UpdateUserDto,
    @UploadedFile() image: Express.Multer.File,
  ) {
    return this.usersService.updateUserById(id, updateUserDto, image);
  }
}
