import { Injectable, Inject } from '@nestjs/common';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { ConfigType } from '@nestjs/config';

import { JwtUserData } from '../../users/types';
import { auth } from '../../config';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
    constructor(@Inject(auth.KEY) private authConfig: ConfigType<typeof auth>) {
        super({
            jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
            ignoreExpiration: false,
            secretOrKey: authConfig.accessSecret,
        });
    }
    validate(payload: JwtUserData) {
        return payload;
    }
}
