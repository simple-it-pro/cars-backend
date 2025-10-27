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

    return instanceToPlain(user) as User;
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
    image: Express.Multer.File,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) throw new BadRequestException(ERROR_MESSAGES.USER.NOT_FOUND);

    if (updateUserDto.nickname) {
      const userWithSameNickname = await this.userRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });

      if (userWithSameNickname && userWithSameNickname.id !== user.id)
        throw new BadRequestException(ERROR_MESSAGES.USER.NICKNAME_DUPLICATE);
    }

    if (updateUserDto.email) {
      const userWithSameEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (userWithSameEmail && userWithSameEmail.id !== user.id)
        throw new BadRequestException(ERROR_MESSAGES.USER.EMAIL_DUPLICATE);
    }

    if (image) {
      const url = await this.storageService.uploadFile(image);
      user.image = {
        name: image.originalname,
        size: image.size,
        url,
      };

      if (user.image) await this.storageService.deleteFile(user.image.url);
    }

    this.userRepository.merge(user, updateUserDto);

    const updatedUser = instanceToPlain(await this.userRepository.save(user));
    return {
      ...updatedUser,
      image: updatedUser.image ? updatedUser.image.url : null,
    } as User;
  }
}
