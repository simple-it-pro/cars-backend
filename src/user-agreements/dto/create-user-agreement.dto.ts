import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsString, IsOptional, IsBoolean } from 'class-validator';
import { AgreementType } from '../entities/user-agreement.entity';

export class CreateUserAgreementDto {
  @ApiProperty({
    enum: AgreementType,
    description: 'Тип соглашения',
    example: AgreementType.PRIVACY_POLICY,
  })
  @IsEnum(AgreementType)
  type: AgreementType;

  @ApiProperty({
    description: 'Название документа',
    example: 'Политика конфиденциальности',
  })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Текстовое содержимое документа',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Активен ли документ',
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
