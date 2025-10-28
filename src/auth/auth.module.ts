import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SmsModule } from '../sms/sms.module';
import { AuthService } from './services';
import { AuthController } from './controllers';
import { JwtRefreshStrategy } from './strategies';
import { User, SmsVerification, RefreshToken } from '../database/entities';

@Module({
    imports: [
        TypeOrmModule.forFeature([User, SmsVerification, RefreshToken]),
        JwtModule,
        SmsModule,
    ],
    controllers: [AuthController],
    providers: [AuthService, JwtRefreshStrategy],
    exports: [AuthService],
})
export class AuthModule {}
