import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsEnum, IsOptional, IsString, IsDateString } from 'class-validator';
import { UserRole } from '../../common/types/roles';

export class CreateUserDto {
  @ApiProperty({ example: UserRole.COMMON, enum: UserRole })
  @IsEnum(UserRole)
  @IsOptional()
  role?: UserRole;

  @ApiProperty({ example: 'user123', required: false })
  @IsString()
  @IsOptional()
  login?: string;

  @ApiProperty({ example: 'password123', required: false })
  @IsString()
  @IsOptional()
  password?: string;

  @ApiProperty({ example: 'JohnDoe', required: false })
  @IsString()
  @IsOptional()
  nickname?: string;

  @ApiProperty({ example: 'John Doe', required: false })
  @IsString()
  @IsOptional()
  name?: string;

  @ApiProperty({ example: '2000-01-01', required: false })
  @IsDateString()
  @IsOptional()
  birthdate?: string;

  @ApiProperty({ example: 'user@example.com', required: false })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiProperty({ example: '+79991234567' })
  @IsString()
  phone: string;

  @ApiProperty({ example: 'Москва', required: false })
  @IsString()
  @IsOptional()
  city?: string;

  @ApiProperty({ example: 'О себе', required: false })
  @IsString()
  @IsOptional()
  about?: string;
}
