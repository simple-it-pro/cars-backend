import {
    Controller,
    Post,
    Body,
    HttpCode,
    UseGuards,
    Req,
    Get,
} from '@nestjs/common';
import {
    ApiTags,
    ApiOperation,
    ApiResponse,
    ApiBearerAuth,
} from '@nestjs/swagger';
import { Request } from 'express';

import { AuthService } from '../services';
import {
    TokensResponseDto,
    TokensResponseDtoWithUser,
    WSTokenResponseDto,
    RefreshTokenDto,
    VerifyCodeDto,
    RequestCodeDto,
} from '../dto';
import { JwtGuard, JwtRefreshGuard } from '../guards';
import { AuthUser } from '../decorators';
import { JwtUserData } from '../../users/types';

@ApiTags('Auth')
@ApiBearerAuth('JWT-auth')
@Controller()
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('request-code')
    @ApiOperation({ summary: 'Запрос кода подтверждения по SMS' })
    @ApiResponse({ status: 201, description: 'Код успешно отправлен' })
    @ApiResponse({ status: 429, description: 'Слишком много запросов' })
    async requestCode(@Body() requestCodeDto: RequestCodeDto) {
        return this.authService.requestVerificationCode(requestCodeDto.phone);
    }

    @Post('verify-code')
    @HttpCode(200)
    @ApiOperation({ summary: 'Подтверждение кода из SMS и авторизация' })
    @ApiResponse({ status: 200, type: TokensResponseDtoWithUser })
    @ApiResponse({ status: 400, description: 'Неверный код' })
    @ApiResponse({ status: 403, description: 'Слишком много попыток' })
    async verifyCode(
        @Body() verifyCodeDto: VerifyCodeDto,
        @Req() req: Request,
    ): Promise<TokensResponseDtoWithUser> {
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
    @ApiOperation({
        summary: 'Обновление access token с помощью refresh token',
    })
    @ApiResponse({ status: 200, type: TokensResponseDto })
    @ApiResponse({ status: 403, description: 'Невалидный refresh token' })
    async refreshTokens(
        @Body() refreshTokenDto: RefreshTokenDto,
        @Req() req: Request,
    ): Promise<TokensResponseDto> {
        const userAgent = req.headers['user-agent'];
        const ip = req.ip || req.connection.remoteAddress;

        return this.authService.refreshTokens(
            refreshTokenDto.refreshToken,
            userAgent,
            ip,
        );
    }

    @Post('logout')
    @HttpCode(200)
    @ApiOperation({ summary: 'Выход из системы' })
    @ApiResponse({ status: 200, description: 'Успешный выход' })
    async logout(@Body() refreshTokenDto: RefreshTokenDto) {
        return this.authService.logout(refreshTokenDto.refreshToken);
    }

    @Get('websocket-token')
    @UseGuards(JwtGuard)
    @ApiBearerAuth('JWT-auth')
    @ApiOperation({ summary: 'Запрос на получение токена веб-сокета' })
    @ApiResponse({ status: 200, type: WSTokenResponseDto })
    async requestWebSocketToken(@AuthUser() { sub: id }: JwtUserData) {
        return this.authService.generateWebSocketToken(id);
    }
}
