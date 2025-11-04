import { Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';

import { JwtUserData } from '../../users/types';
import { auth } from '../../config';
import { InjectRepository } from '@nestjs/typeorm';
import { RefreshToken } from '../../database/entities';
import { MoreThan, Repository } from 'typeorm';
import { ERROR_MESSAGES } from '../../common/constants/messages';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(
        @Inject(auth.KEY) private authConfig: ConfigType<typeof auth>,
        @InjectRepository(RefreshToken)
        private readonly refreshTokenRepository: Repository<RefreshToken>,
    ) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: authConfig.accessSecret,
        });
    }

    async validate(payload: JwtUserData) {
        if (payload?.type !== 'access' || !payload?.jti || !payload?.sub) {
            throw new UnauthorizedException(
                ERROR_MESSAGES.AUTH.WRONG_TOKEN_TYPE,
            );
        }

        const exists = await this.refreshTokenRepository.exist({
            where: {
                tokenId: payload.jti,

                expiresAt: MoreThan(new Date()),
            },
        });

        if (!exists) {
            throw new UnauthorizedException(
                ERROR_MESSAGES.AUTH.SESSION_REVOKED ?? 'Session revoked',
            );
        }

        return { sub: payload.sub, phone: payload.phone, jti: payload.jti };
    }
}
