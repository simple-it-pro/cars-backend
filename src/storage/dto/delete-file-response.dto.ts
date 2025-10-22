import { ApiProperty } from '@nestjs/swagger';

export class DeleteFileResponseDto {
  @ApiProperty({ description: 'Сообщение об успешном удалении' })
  message: string;
}
