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

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getUserById(id: number): Promise<User | null> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`'Пользователь с данным id не найден'`);
    }

    return instanceToPlain(user) as User;
  }

  async updateUserById(
    id: number,
    updateUserDto: UpdateUserDto,
  ): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new BadRequestException('Пользователь с данным id не найден');
    }

    if (updateUserDto.nickname) {
      const userWithSameNickname = await this.userRepository.findOne({
        where: { nickname: updateUserDto.nickname },
      });

      if (userWithSameNickname && userWithSameNickname.id !== user.id) {
        throw new BadRequestException(
          'Пользователь с таким никнеймом уже существует',
        );
      }
    }

    if (updateUserDto.email) {
      const userWithSameEmail = await this.userRepository.findOne({
        where: { email: updateUserDto.email },
      });

      if (userWithSameEmail && userWithSameEmail.id !== user.id) {
        throw new BadRequestException(
          'Пользователь с таким email уже существует',
        );
      }
    }

    this.userRepository.merge(user, updateUserDto);

    const updatedUser = await this.userRepository.save(user);
    return instanceToPlain(updatedUser) as User;
  }
}
