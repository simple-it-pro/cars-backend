import {
    Injectable,
    NestInterceptor,
    ExecutionContext,
    CallHandler,
} from '@nestjs/common';
import { map } from 'rxjs/operators';

const pickPublicUser = (user: any) => {
    if (!user) return user;
    const allowed = [
        'id',
        'nickname',
        'name',
        'city',
        'image',
        'rating',
        'createdAt',
        'posts',
    ];
    const out: any = {};
    for (const k of allowed) if (k in user) out[k] = user[k];
    return out;
};

@Injectable()
export class PublicProfileSanitizeInterceptor implements NestInterceptor {
    intercept(_ctx: ExecutionContext, next: CallHandler) {
        return next.handle().pipe(
            map((data) => {
                if (Array.isArray(data)) return data.map(pickPublicUser);
                return pickPublicUser(data);
            }),
        );
    }
}
