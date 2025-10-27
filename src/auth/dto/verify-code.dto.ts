import { IsPhoneNumber, IsNotEmpty, Length, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class VerifyCodeDto {
    @ApiProperty({
        example: '+79991234567',
        description: 'Номер телефона',
    })
    @IsPhoneNumber('RU', { message: 'Неверный формат номера телефона' })
    @IsNotEmpty()
    phone: string;

    @ApiProperty({
        example: '1234',
        description: 'Код подтверждения из SMS',
    })
    @IsString()
    @Length(4, 4, { message: 'Код должен содержать 4 цифры' })
    @IsNotEmpty()
    code: string;
}
