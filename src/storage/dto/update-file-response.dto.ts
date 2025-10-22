import { ApiProperty } from '@nestjs/swagger';

export class UploadFileResponseDto {
  @ApiProperty({ description: 'Уникальный ключ файла в хранилище' })
  key: string;

  @ApiProperty({ description: 'Оригинальное имя файла' })
  originalName: string;

  @ApiProperty({ description: 'Размер файла в байтах' })
  size: number;

  @ApiProperty({ description: 'MIME-тип файла' })
  contentType: string;
}
