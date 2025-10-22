import { ApiProperty } from '@nestjs/swagger';

export class FileUrlResponseDto {
  @ApiProperty({ description: 'Signed URL для доступа к файлу' })
  url: string;
}
