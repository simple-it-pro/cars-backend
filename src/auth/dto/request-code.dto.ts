import { IsPhoneNumber, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class RequestCodeDto {
  @ApiProperty({
    example: '+79991234567',
    description: 'Номер телефона',
  })
  @IsPhoneNumber('RU', { message: 'Неверный формат номера телефона' })
  @IsNotEmpty()
  phone: string;
}
