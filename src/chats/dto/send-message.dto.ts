import {
  IsNotEmpty,
  IsOptional,
  IsArray,
  ValidateNested,
  IsEnum,
  IsUrl,
  IsNumber,
} from 'class-validator';
import { Type } from 'class-transformer';

class AttachmentDto {
  @IsEnum(['image', 'video', 'file'])
  type: 'image' | 'video' | 'file';

  @IsUrl()
  url: string;

  @IsNotEmpty()
  name: string;

  @IsNumber()
  size: number;
}

export class SendMessageDto {
  @IsNotEmpty()
  content: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AttachmentDto)
  attachments?: AttachmentDto[];
}
