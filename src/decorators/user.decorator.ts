import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { JwtUserData } from '../users/types';

export const AuthUser = createParamDecorator(
  (data: never, ctx: ExecutionContext): JwtUserData => {
    const request = ctx.switchToHttp().getRequest();

    return request.user as JwtUserData;
  },
);
