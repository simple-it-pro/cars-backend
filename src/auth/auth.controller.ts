import {
  Controller,
  Post,
  Body,
  HttpCode,
  UseGuards,
  Req,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthService } from './auth.service';
import { RequestCodeDto } from './dto/request-code.dto';
import { VerifyCodeDto } from './dto/verify-code.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensResponseDto } from './dto/tokens-response.dto';
import { JwtRefreshGuard } from '../guard/jwt-refresh.guard';
import { JwtGuard } from '../guard/jwt.guard';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('request-code')
  @ApiOperation({ summary: 'Запрос кода подтверждения по SMS' })
  @ApiResponse({ status: 200, description: 'Код отправлен' })
  @ApiResponse({ status: 400, description: 'Неверные данные' })
  @ApiResponse({ status: 429, description: 'Слишком много запросов' })
  async requestCode(@Body() requestCodeDto: RequestCodeDto) {
    return this.authService.requestVerificationCode(requestCodeDto.phone);
  }

  @Post('verify-code')
  @HttpCode(200)
  @ApiOperation({ summary: 'Подтверждение кода из SMS и авторизация' })
  @ApiResponse({ status: 200, type: TokensResponseDto })
  @ApiResponse({ status: 400, description: 'Неверный код' })
  @ApiResponse({ status: 403, description: 'Номер заблокирован' })
  async verifyCode(
    @Body() verifyCodeDto: VerifyCodeDto,
    @Req() req: Request,
  ): Promise<TokensResponseDto> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;

    return this.authService.verifyCode(
      verifyCodeDto.phone,
      verifyCodeDto.code,
      userAgent,
      ip,
    );
  }

  @Post('refresh')
  @UseGuards(JwtRefreshGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Обновление access token с помощью refresh token' })
  @ApiResponse({ status: 200, type: TokensResponseDto })
  @ApiResponse({ status: 403, description: 'Невалидный refresh token' })
  async refreshTokens(
    @Body() refreshTokenDto: RefreshTokenDto,
    @Req() req: Request,
  ): Promise<Omit<TokensResponseDto, 'user'>> {
    const userAgent = req.headers['user-agent'];
    const ip = req.ip || req.connection.remoteAddress;

    return this.authService.refreshTokens(
      refreshTokenDto.refreshToken,
      userAgent,
      ip,
    );
  }

  @Post('logout')
  @UseGuards(JwtGuard)
  @HttpCode(200)
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход' })
  async logout(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.logout(refreshTokenDto.refreshToken);
  }
}
