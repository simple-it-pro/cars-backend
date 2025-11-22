import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  UnauthorizedException,
} from '@nestjs/common';
import { AdminRole } from '../common/types/roles';

@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new UnauthorizedException('Пользователь не авторизован');
    }

    if (user.role !== AdminRole.ADMIN) {
      throw new ForbiddenException('Доступ запрещен. Требуются права администратора');
    }

    return true;
  }
}
