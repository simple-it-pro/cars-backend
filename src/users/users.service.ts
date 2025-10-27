import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { instanceToPlain } from 'class-transformer';
import { UpdateUserDto } from './dto/update-user.dto';
import { ERROR_MESSAGES } from '../common/constants/messages';
import { StorageService } from '../storage/storage.service';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    private readonly storageService: StorageService,
  ) {}

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new NotFoundException(ERROR_MESSAGES.USER.NOT_FOUND);

    if (user.image)
      user.image.url = await this.storageService.getFileUrl(user.image.url);

    return instanceToPlain(user) as User;
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
    image?: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

    if (updateUserDto.nickname) {
      const userWithSameNickname = await this.userRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });

      if (userWithSameNickname && userWithSameNickname.id !== user.id)
        throw new BadRequestException(ERROR_MESSAGES.USER.NICKNAME_DUPLICATE);

      user.nickname = updateUserDto.nickname;
    }

    if (updateUserDto.email) {
      const userWithSameEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (userWithSameEmail && userWithSameEmail.id !== user.id)
        throw new BadRequestException(ERROR_MESSAGES.USER.EMAIL_DUPLICATE);

      user.email = updateUserDto.email;
    }

    if (updateUserDto.phone) {
      const userWithSamePhone = await this.userRepository.findOne({
        where: { phone: updateUserDto.phone },
      });

      if (userWithSamePhone && userWithSamePhone.id !== user.id)
        throw new BadRequestException(ERROR_MESSAGES.USER.PHONE_DUPLICATE);

      user.phone = updateUserDto.phone;
    }

    if (image) {
      if (user.image) await this.storageService.deleteFile(user.image.url);

      const url = await this.storageService.uploadFile(image);
      user.image = {
        name: image.originalname,
        size: image.size,
        url,
      };
    }

    this.userRepository.merge(user, updateUserDto);

    const savedUser = await this.userRepository.save(user);

    return instanceToPlain(savedUser) as User;
  }
}
