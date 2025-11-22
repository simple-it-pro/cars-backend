import { ApiProperty } from '@nestjs/swagger';

export class UploadDocumentDto {
  @ApiProperty({
    type: 'string',
    format: 'binary',
    description: 'Файл документа (PDF или DOCX)',
  })
  file: Express.Multer.File;
}

export class DocumentResponseDto {
  @ApiProperty({ description: 'URL файла' })
  url: string;

  @ApiProperty({ description: 'Имя файла' })
  name: string;

  @ApiProperty({ description: 'Размер файла в байтах' })
  size: number;

  @ApiProperty({ description: 'MIME тип файла' })
  mimeType: string;

  @ApiProperty({ description: 'Дата загрузки' })
  uploadedAt: Date;
}
