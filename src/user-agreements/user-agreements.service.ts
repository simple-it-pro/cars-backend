import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserAgreement, AgreementType, AgreementDocument } from './entities/user-agreement.entity';
import { CreateUserAgreementDto } from './dto/create-user-agreement.dto';
import { UpdateUserAgreementDto } from './dto/update-user-agreement.dto';
import * as path from 'path';
import * as fs from 'fs';

@Injectable()
export class UserAgreementsService {
  private readonly uploadDir = path.join(process.cwd(), 'public', 'agreements');

  constructor(
    @InjectRepository(UserAgreement)
    private readonly userAgreementRepository: Repository<UserAgreement>,
  ) {
    // Создаем директорию для файлов если не существует
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async findAll(): Promise<UserAgreement[]> {
    return this.userAgreementRepository.find({
      order: { type: 'ASC', createdAt: 'DESC' },
    });
  }

  async findById(id: string): Promise<UserAgreement> {
    const agreement = await this.userAgreementRepository.findOne({
      where: { id },
    });
    if (!agreement) {
      throw new NotFoundException('Документ не найден');
    }
    return agreement;
  }

  async findByType(type: AgreementType): Promise<UserAgreement | null> {
    return this.userAgreementRepository.findOne({
      where: { type },
    });
  }

  async create(dto: CreateUserAgreementDto): Promise<UserAgreement> {
    // Проверяем, существует ли уже документ с таким типом
    const existing = await this.findByType(dto.type);
    if (existing) {
      throw new BadRequestException(
        `Документ типа "${dto.type}" уже существует. Используйте обновление.`,
      );
    }

    const agreement = this.userAgreementRepository.create({
      ...dto,
      version: 1,
    });
    return this.userAgreementRepository.save(agreement);
  }

  async update(id: string, dto: UpdateUserAgreementDto): Promise<UserAgreement> {
    const agreement = await this.findById(id);

    Object.assign(agreement, dto);

    return this.userAgreementRepository.save(agreement);
  }

  async uploadDocument(
    id: string,
    file: Express.Multer.File,
  ): Promise<UserAgreement> {
    const agreement = await this.findById(id);

    // Проверяем тип файла
    const allowedMimeTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
    ];

    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        'Допустимые форматы файлов: PDF, DOCX, DOC',
      );
    }

    // Удаляем старый файл если есть
    if (agreement.document?.url) {
      const oldFilePath = path.join(process.cwd(), 'public', agreement.document.url);
      if (fs.existsSync(oldFilePath)) {
        fs.unlinkSync(oldFilePath);
      }
    }

    // Генерируем уникальное имя файла
    const ext = path.extname(file.originalname);
    const fileName = `${agreement.type}_v${agreement.version}_${Date.now()}${ext}`;
    const filePath = path.join(this.uploadDir, fileName);

    // Сохраняем файл
    fs.writeFileSync(filePath, file.buffer);

    // Обновляем документ
    const document: AgreementDocument = {
      url: `/agreements/${fileName}`,
      name: file.originalname,
      size: file.size,
      mimeType: file.mimetype,
      uploadedAt: new Date(),
    };

    agreement.document = document;

    return this.userAgreementRepository.save(agreement);
  }

  async deleteDocument(id: string): Promise<UserAgreement> {
    const agreement = await this.findById(id);

    if (agreement.document?.url) {
      const filePath = path.join(process.cwd(), 'public', agreement.document.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    agreement.document = null;

    return this.userAgreementRepository.save(agreement);
  }

  async delete(id: string): Promise<void> {
    const agreement = await this.findById(id);

    // Удаляем файл если есть
    if (agreement.document?.url) {
      const filePath = path.join(process.cwd(), 'public', agreement.document.url);
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    }

    await this.userAgreementRepository.remove(agreement);
  }

  async incrementVersion(id: string): Promise<UserAgreement> {
    const agreement = await this.findById(id);
    agreement.version += 1;
    return this.userAgreementRepository.save(agreement);
  }
}
