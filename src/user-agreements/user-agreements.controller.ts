import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseUUIDPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiConsumes,
  ApiBody,
} from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserAgreementsService } from './user-agreements.service';
import { JwtGuard } from '../guard/jwt.guard';
import { AdminGuard } from '../guard/admin.guard';
import { CreateUserAgreementDto } from './dto/create-user-agreement.dto';
import { UpdateUserAgreementDto } from './dto/update-user-agreement.dto';
import { UserAgreement } from './entities/user-agreement.entity';

@ApiTags('Admin - Пользовательские соглашения')
@ApiBearerAuth()
@Controller('admin/user-agreements')
@UseGuards(JwtGuard, AdminGuard)
export class UserAgreementsController {
  constructor(private readonly userAgreementsService: UserAgreementsService) {}

  @Get()
  @ApiOperation({ summary: 'Получить все пользовательские соглашения' })
  @ApiResponse({
    status: 200,
    description: 'Список соглашений успешно получен',
    type: [UserAgreement],
  })
  async findAll(): Promise<UserAgreement[]> {
    return this.userAgreementsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Получить соглашение по ID' })
  @ApiResponse({
    status: 200,
    description: 'Соглашение найдено',
    type: UserAgreement,
  })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  async findById(@Param('id', ParseUUIDPipe) id: string): Promise<UserAgreement> {
    return this.userAgreementsService.findById(id);
  }

  @Post()
  @ApiOperation({ summary: 'Создать новое пользовательское соглашение' })
  @ApiResponse({
    status: 201,
    description: 'Соглашение успешно создано',
    type: UserAgreement,
  })
  @ApiResponse({ status: 400, description: 'Документ с таким типом уже существует' })
  async create(@Body() dto: CreateUserAgreementDto): Promise<UserAgreement> {
    return this.userAgreementsService.create(dto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Обновить пользовательское соглашение' })
  @ApiResponse({
    status: 200,
    description: 'Соглашение успешно обновлено',
    type: UserAgreement,
  })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserAgreementDto,
  ): Promise<UserAgreement> {
    return this.userAgreementsService.update(id, dto);
  }

  @Post(':id/document')
  @ApiOperation({ summary: 'Загрузить документ (PDF или DOCX)' })
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        file: {
          type: 'string',
          format: 'binary',
          description: 'Файл документа (PDF, DOCX, DOC)',
        },
      },
    },
  })
  @ApiResponse({
    status: 200,
    description: 'Документ успешно загружен',
    type: UserAgreement,
  })
  @ApiResponse({ status: 400, description: 'Неверный формат файла' })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @Param('id', ParseUUIDPipe) id: string,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<UserAgreement> {
    return this.userAgreementsService.uploadDocument(id, file);
  }

  @Delete(':id/document')
  @ApiOperation({ summary: 'Удалить загруженный документ' })
  @ApiResponse({
    status: 200,
    description: 'Документ успешно удален',
    type: UserAgreement,
  })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  async deleteDocument(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserAgreement> {
    return this.userAgreementsService.deleteDocument(id);
  }

  @Post(':id/increment-version')
  @ApiOperation({ summary: 'Увеличить версию документа' })
  @ApiResponse({
    status: 200,
    description: 'Версия увеличена',
    type: UserAgreement,
  })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  async incrementVersion(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserAgreement> {
    return this.userAgreementsService.incrementVersion(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Удалить пользовательское соглашение' })
  @ApiResponse({ status: 200, description: 'Соглашение успешно удалено' })
  @ApiResponse({ status: 404, description: 'Соглашение не найдено' })
  async delete(@Param('id', ParseUUIDPipe) id: string): Promise<{ message: string }> {
    await this.userAgreementsService.delete(id);
    return { message: 'Соглашение успешно удалено' };
  }
}
