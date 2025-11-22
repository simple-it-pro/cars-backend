import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsOptional, IsBoolean, IsInt, Min } from 'class-validator';

export class UpdateUserAgreementDto {
  @ApiPropertyOptional({
    description: 'Название документа',
    example: 'Политика конфиденциальности',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Текстовое содержимое документа',
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'Версия документа',
    example: 2,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  version?: number;

  @ApiPropertyOptional({
    description: 'Активен ли документ',
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}
