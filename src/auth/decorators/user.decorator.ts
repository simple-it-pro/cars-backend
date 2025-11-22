import {
    BadRequestException,
    createParamDecorator,
    ExecutionContext,
} from '@nestjs/common';
import { validate as uuidValidate, version as uuidVersion } from 'uuid';
import { JwtUserData } from '../../users/types';

export const AuthUser = createParamDecorator(
    (data: never, ctx: ExecutionContext): JwtUserData => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user as JwtUserData;

        if (!uuidValidate(user.sub) || uuidVersion(user.sub) !== 4) {
            throw new BadRequestException('Invalid user ID format in JWT');
        }

        return request.user as JwtUserData;
    },
);
