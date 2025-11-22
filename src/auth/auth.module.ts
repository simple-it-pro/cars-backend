import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmsModule } from '../sms/sms.module';
import { AuthService } from './services';
import { AuthController } from './controllers';
import { JwtStrategy, JwtRefreshStrategy } from './strategies';
import { User, SmsVerification, RefreshToken } from '../database/entities';
import { PassportModule } from '@nestjs/passport';
import { StorageModule } from '../storage/storage.module';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, SmsVerification, RefreshToken]),
        PassportModule.register({ defaultStrategy: 'jwt' }),
        JwtModule,
        SmsModule,
        StorageModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtStrategy, JwtRefreshStrategy],
    exports: [AuthService, PassportModule],
})
export class AuthModule {}
