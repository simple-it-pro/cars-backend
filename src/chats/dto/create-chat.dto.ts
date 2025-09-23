import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateChatDto {
  @IsNumber()
  @IsNotEmpty()
  partnerId: number;
}
