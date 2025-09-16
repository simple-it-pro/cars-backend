import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import * as bcrypt from 'bcryptjs';
import { SmsService } from '../sms/sms.service';
import { User } from '../users/entities/user.entity';
import { SmsVerification } from './entities/sms-verification.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { randomUUID } from 'crypto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private readonly verificationConfig;

  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    @InjectRepository(SmsVerification)
    private smsVerificationRepository: Repository<SmsVerification>,
    @InjectRepository(RefreshToken)
    private refreshTokenRepository: Repository<RefreshToken>,
    private jwtService: JwtService,
    private configService: ConfigService,
    private smsService: SmsService,
  ) {
    this.verificationConfig = this.configService.get('verification');
  }

  async requestVerificationCode(phone: string): Promise<{ message: string }> {
    const normalizedPhone = this.normalizePhone(phone);

    await this.checkFloodProtection(normalizedPhone);

    const code = this.generateCode(this.verificationConfig.codeLength);
    const codeHash = await bcrypt.hash(code, 10);

    await this.smsVerificationRepository.delete({ phone: normalizedPhone });

    const verification = this.smsVerificationRepository.create({
      phone: normalizedPhone,
      codeHash,
      expiresAt: new Date(Date.now() + this.verificationConfig.codeTtl),
    });

    await this.smsVerificationRepository.save(verification);

    const sent = await this.smsService.sendVerificationCode(
      normalizedPhone,
      code,
    );

    if (!sent) {
      throw new BadRequestException('Не удалось отправить SMS');
    }

    return { message: 'Код подтверждения отправлен' };
  }

  async verifyCode(
    phone: string,
    code: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ accessToken: string; refreshToken: string; user: User }> {
    const normalizedPhone = this.normalizePhone(phone);

    const verification = await this.smsVerificationRepository.findOne({
      where: {
        phone: normalizedPhone,
        expiresAt: MoreThan(new Date()),
        isBlocked: false,
      },
    });

    if (!verification) {
      throw new BadRequestException('Код не найден или истек');
    }

    if (verification.blockedUntil && verification.blockedUntil > new Date()) {
      throw new ForbiddenException('Слишком много попыток. Попробуйте позже');
    }

    const isValid = await bcrypt.compare(code, verification.codeHash);

    if (!isValid) {
      verification.attempts += 1;

      if (verification.attempts >= this.verificationConfig.maxAttempts) {
        verification.isBlocked = true;
        verification.blockedUntil = new Date(
          Date.now() + this.verificationConfig.blockTime,
        );
      }

      await this.smsVerificationRepository.save(verification);
      throw new BadRequestException('Неверный код подтверждения');
    }

    await this.smsVerificationRepository.delete(verification.id);

    let user = await this.userRepository.findOne({
      where: { phone: normalizedPhone },
    });

    if (!user) {
      user = this.userRepository.create({ phone: normalizedPhone });
      user = await this.userRepository.save(user);
    }

    const tokens = await this.generateTokens(user, userAgent, ip);

    return { ...tokens, user };
  }

  async refreshTokens(
    refreshToken: string,
    userAgent?: string,
    ip?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    let payload: any;
    try {
      payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });
    } catch (error) {
      throw new ForbiddenException('Невалидный refresh token');
    }

    if (payload.type !== 'refresh') {
      throw new ForbiddenException('Неверный тип токена');
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
        'Refresh token не найден или уже использован',
      );
    }

    const isMatch = await bcrypt.compare(refreshToken, storedToken.tokenHash);
    if (!isMatch) {
      throw new ForbiddenException('Невалидный refresh token');
    }

    await this.refreshTokenRepository.delete(storedToken.id);

    return await this.generateTokens(storedToken.user, userAgent, ip);
  }

  async logout(refreshToken: string): Promise<void> {
    const tokenHash = await bcrypt.hash(refreshToken, 10);
    await this.refreshTokenRepository.delete({ tokenHash });
  }

  private async generateTokens(
    user: User,
    userAgent?: string,
    ip?: string,
  ): Promise<{ accessToken: string; refreshToken: string }> {
    const accessPayload = {
      sub: user.id,
      phone: user.phone,
      type: 'access',
    };

    const refreshPayload = {
      sub: user.id,
      phone: user.phone,
      type: 'refresh',
      jti: randomUUID(),
    };

    const accessToken = this.jwtService.sign(accessPayload, {
      secret: this.configService.get('jwt.accessSecret'),
      expiresIn: this.configService.get('jwt.accessExpiresIn'),
    });

    const refreshToken = this.jwtService.sign(refreshPayload, {
      secret: this.configService.get('jwt.refreshSecret'),
      expiresIn: this.configService.get('jwt.refreshExpiresIn'),
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
      tokenId: refreshPayload.jti,
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

    if (recentRequests >= this.verificationConfig.maxRequestsPerMinute) {
      throw new ForbiddenException('Слишком много запросов. Попробуйте позже');
    }
  }

  private generateCode(length: number): string {
    return Array.from({ length }, () => Math.floor(Math.random() * 10)).join(
      '',
    );
  }

  private normalizePhone(phone: string): string {
    return phone.replace(/[^0-9+]/g, '');
  }
}
