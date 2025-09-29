import { IsNotEmpty, IsNumber } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChatDto {
  @ApiProperty({
    example: 123,
    description: 'ID пользователя для создания чата',
  })
  @IsNumber()
  @IsNotEmpty()
  partnerId: number;
}
