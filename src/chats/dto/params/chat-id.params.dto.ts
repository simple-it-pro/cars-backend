import { ApiProperty } from '@nestjs/swagger';
import { IsUUID } from 'class-validator';

export class ChatIdParamsDto {
  @ApiProperty({
    description: 'ID чата',
    example: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
  })
  @IsUUID()
  chatId: string;
}
