import {
    Injectable,
    BadRequestException,
    ForbiddenException,
    HttpException,
    HttpStatus,
    Logger,
    Inject,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { ConfigType } from '@nestjs/config';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { instanceToPlain } from 'class-transformer';
import { randomUUID } from 'crypto';
import { SignOptions } from 'jsonwebtoken';

import { SmsService } from '../../sms/services';
import { WSTokenResponseDto } from '../dto';
import {
    ERROR_MESSAGES,
    SUCCESS_MESSAGES,
} from '../../common/constants/messages';
import { User, SmsVerification, RefreshToken } from '../../database/entities';
import { auth } from '../../config';

@Injectable()
export class AuthService {
    private readonly logger = new Logger(AuthService.name);
    private readonly verificationConfig = {
        codeLength: 4,
        codeTtl: 5 * 60 * 1000, // 5 минут
        maxAttempts: 3,
        blockTime: 5 * 60 * 1000, // 5 минут
        maxRequestsPerMinute: 1, // Защита от флуда
    };

    constructor(
        @Inject(auth.KEY)
        private authConfig: ConfigType<typeof auth>,
        @InjectRepository(User) private userRepository: Repository<User>,
        @InjectRepository(SmsVerification)
        private smsVerificationRepository: Repository<SmsVerification>,
        @InjectRepository(RefreshToken)
        private refreshTokenRepository: Repository<RefreshToken>,
        private jwtService: JwtService,
        private smsService: SmsService,
    ) {}

    async requestVerificationCode(phone: string): Promise<{ message: string }> {
        const normalizedPhone = this.normalizePhone(phone);

        await this.checkFloodProtection(normalizedPhone);

        const code = this.generateCode(
            Number(this.verificationConfig.codeLength),
        );
        const codeHash = await bcrypt.hash(code, 10);

        await this.smsVerificationRepository.delete({ phone: normalizedPhone });

        const verification = this.smsVerificationRepository.create({
            phone: normalizedPhone,
            codeHash,
            expiresAt: new Date(
                Date.now() + Number(this.verificationConfig.codeTtl),
            ),
        });

        await this.smsVerificationRepository.save(verification);

        const sent = await this.smsService.sendVerificationCode(
            normalizedPhone,
            code,
        );

        if (!sent) {
            throw new BadRequestException(ERROR_MESSAGES.AUTH.SMS_FAIL);
        }

        return { message: SUCCESS_MESSAGES.AUTH.SMS_SUCCESS };
    }

    async verifyCode(
        phone: string,
        code: string,
        userAgent?: string,
        ip?: string,
    ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
        const normalizedPhone = this.normalizePhone(phone);
        const isTestMode = process.env.SMS_TEST_MODE;

        if (!isTestMode) {
            const verification = await this.smsVerificationRepository.findOne({
                where: {
                    phone: normalizedPhone,
                    expiresAt: MoreThan(new Date()),
                },
            });

            if (!verification) {
                throw new BadRequestException(ERROR_MESSAGES.AUTH.CODE_EXPIRED);
            }

            if (
                verification.blockedUntil &&
                verification.blockedUntil > new Date()
            ) {
                throw new ForbiddenException(
                    ERROR_MESSAGES.AUTH.TOO_MANY_ATTEMPTS,
                );
            }

            const isValid = await bcrypt.compare(code, verification.codeHash);

            if (!isValid) {
                verification.attempts += 1;

                if (
                    verification.attempts >=
                    Number(this.verificationConfig.maxAttempts)
                ) {
                    verification.isBlocked = true;
                    verification.blockedUntil = new Date(
                        Date.now() + Number(this.verificationConfig.blockTime),
                    );
                }

                await this.smsVerificationRepository.save(verification);
                throw new BadRequestException(ERROR_MESSAGES.AUTH.WRONG_CODE);
            }

            await this.smsVerificationRepository.delete(verification.id);
        }

        let user = await this.userRepository.findOne({
            where: { phone: normalizedPhone },
        });

        if (!user) {
            user = this.userRepository.create({ phone: normalizedPhone });
            user = await this.userRepository.save(user);
        }

        const tokens = await this.generateTokens(user, userAgent, ip);

        return { ...tokens, user: instanceToPlain(user) as User };
    }

    async refreshTokens(
        refreshToken: string,
        userAgent?: string,
        ip?: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        let payload: any;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.authConfig.refreshSecret,
            });
        } catch {
            throw new ForbiddenException(
                ERROR_MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
            );
        }

        if (payload.type !== 'refresh') {
            throw new ForbiddenException(ERROR_MESSAGES.AUTH.WRONG_TOKEN_TYPE);
        }

        const storedToken = await this.refreshTokenRepository.findOne({
            where: {
                tokenId: payload.jti,
                user: { id: payload.sub },
                expiresAt: MoreThan(new Date()),
            },
            relations: ['user'],
        });

        if (!storedToken) {
            throw new ForbiddenException(
                ERROR_MESSAGES.AUTH.REFRESH_TOKEN_NOT_FOUND,
            );
        }

        const isMatch = await bcrypt.compare(
            refreshToken,
            storedToken.tokenHash,
        );
        if (!isMatch) {
            throw new ForbiddenException(
                ERROR_MESSAGES.AUTH.INVALID_REFRESH_TOKEN,
            );
        }

        await this.refreshTokenRepository.delete(storedToken.id);

        return await this.generateTokens(storedToken.user, userAgent, ip);
    }

    async logout(refreshToken: string): Promise<void> {
        let payload: any;
        try {
            payload = this.jwtService.verify(refreshToken, {
                secret: this.authConfig.refreshSecret,
            });
        } catch {
            return;
        }

        if (payload?.type !== 'refresh' || !payload?.jti) return;

        await this.refreshTokenRepository.delete({ tokenId: payload.jti });
    }

    private async generateTokens(
        user: User,
        userAgent?: string,
        ip?: string,
    ): Promise<{ accessToken: string; refreshToken: string }> {
        const sessionId = randomUUID();

        const accessPayload = {
            sub: user.id,
            phone: user.phone,
            type: 'access',
            jti: sessionId,
        };

        const refreshPayload = {
            sub: user.id,
            phone: user.phone,
            type: 'refresh',
            jti: sessionId,
        };

        const accessToken = this.jwtService.sign(accessPayload, {
            secret: this.authConfig.accessSecret,
            expiresIn: this.authConfig
                .accessExpiresIn as SignOptions['expiresIn'],
        });

        const refreshToken = this.jwtService.sign(refreshPayload, {
            secret: this.authConfig.refreshSecret,
            expiresIn: this.authConfig
                .refreshExpiresIn as SignOptions['expiresIn'],
        });

        const tokenHash = await bcrypt.hash(refreshToken, 10);
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 30);

        const refreshTokenEntity = this.refreshTokenRepository.create({
            tokenHash,
            expiresAt,
            userAgent,
            ipAddress: ip,
            user,
            tokenId: sessionId,
        });

        await this.refreshTokenRepository.save(refreshTokenEntity);

        return { accessToken, refreshToken };
    }

    private async checkFloodProtection(phone: string): Promise<void> {
        const oneMinuteAgo = new Date(Date.now() - 60000);

        const recentRequests = await this.smsVerificationRepository.count({
            where: {
                phone,
                createdAt: MoreThan(oneMinuteAgo),
            },
        });

        if (
            recentRequests >=
            Number(this.verificationConfig.maxRequestsPerMinute)
        ) {
            const lastVerification =
                await this.smsVerificationRepository.findOne({
                    where: { phone },
                    order: { createdAt: 'DESC' },
                });

            if (lastVerification) {
                const cooldownMs = 60 * 1000;
                const nextAllowedAt = new Date(
                    lastVerification.createdAt.getTime() + cooldownMs,
                );
                if (nextAllowedAt > new Date()) {
                    const secondsLeft = Math.ceil(
                        (nextAllowedAt.getTime() - Date.now()) / 1000,
                    );
                    throw new HttpException(
                        `Новый код можно запросить через ${secondsLeft} сек`,
                        HttpStatus.TOO_MANY_REQUESTS,
                    );
                }
            }
        }
    }

    private generateCode(length: number): string {
        return Array.from({ length }, () =>
            Math.floor(Math.random() * 10),
        ).join('');
    }

    private normalizePhone(phone: string): string {
        return phone.replace(/[^0-9+]/g, '');
    }

    generateWebSocketToken(userId: number): WSTokenResponseDto {
        const wsToken = this.jwtService.sign(
            {
                sub: userId,
                type: 'websocket',
            },
            {
                secret: this.authConfig.websocketSecret,
                expiresIn: this.authConfig
                    .websocketExpiresIn as SignOptions['expiresIn'],
            },
        );

        return { wsToken };
    }

    verifyWebSocketToken(token: string) {
        try {
            const payload = this.jwtService.verify(token, {
                secret: this.authConfig.websocketSecret,
            });
            if (payload.type !== 'websocket') {
                throw new Error(ERROR_MESSAGES.AUTH.WRONG_TOKEN_TYPE);
            }
            return payload;
        } catch (error) {
            this.logger.error('Error verifying websocket token:', error);
            throw new Error(ERROR_MESSAGES.AUTH.INVALID_WEBSOCKET_TOKEN);
        }
    }
}
