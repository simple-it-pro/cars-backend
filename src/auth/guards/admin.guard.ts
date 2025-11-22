import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../database/entities';
import { UserRole } from '../../common/types';

@Injectable()
export class AdminGuard implements CanActivate {
    constructor(
        @InjectRepository(User)
        private readonly usersRepository: Repository<User>,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const user = request.user;

        if (!user?.sub) {
            throw new ForbiddenException('Доступ запрещен');
        }

        const dbUser = await this.usersRepository.findOne({
            where: { id: user.sub },
            select: ['id', 'role'],
        });

        if (!dbUser || (dbUser.role !== UserRole.ADMIN && dbUser.role !== UserRole.ADVANCED)) {
            throw new ForbiddenException('Требуются права администратора');
        }

        return true;
    }
}
