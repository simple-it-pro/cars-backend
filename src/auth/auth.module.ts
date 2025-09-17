import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { SmsModule } from '../sms/sms.module';
import { User } from '../users/entities/user.entity';
import { SmsVerification } from './entities/sms-verification.entity';
import { RefreshToken } from './entities/refresh-token.entity';
import { JwtRefreshStrategy } from '../strategies/jwt-refresh.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, SmsVerification, RefreshToken]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        secret: configService.get('jwt.accessSecret'),
        signOptions: { expiresIn: configService.get('jwt.accessExpiresIn') },
      }),
      inject: [ConfigService],
    }),
    ConfigModule,
    SmsModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtRefreshStrategy],
  exports: [AuthService],
})
export class AuthModule {}
