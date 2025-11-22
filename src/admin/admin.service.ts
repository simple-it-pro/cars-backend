import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { User } from '../users/entities/user.entity';
import { Chat } from '../chats/entities/chat.entity';
import { Message } from '../chats/entities/message.entity';
import { MessageContent } from '../chats/entities/message-content.entity';
import { Review } from '../reviews/entities/review.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { CreateChatDto } from './dto/create-chat.dto';
import { CreateMessageDto } from './dto/create-message.dto';
import { UpdateMessageDto } from './dto/update-message.dto';
import { CreateReviewDto } from './dto/create-review.dto';
import { UpdateReviewDto } from './dto/update-review.dto';
import * as bcrypt from 'bcryptjs';

@Injectable()
export class AdminService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(Chat)
    private readonly chatRepository: Repository<Chat>,
    @InjectRepository(Message)
    private readonly messageRepository: Repository<Message>,
    @InjectRepository(MessageContent)
    private readonly messageContentRepository: Repository<MessageContent>,
    @InjectRepository(Review)
    private readonly reviewRepository: Repository<Review>,
  ) {}

  // Users CRUD
  async findAllUsers(page = 1, limit = 50): Promise<{ data: User[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { data, total, page, limit };
  }

  async findUserById(id: number): Promise<User> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`Пользователь с ID ${id} не найден`);
    }
    return user;
  }

  async createUser(createUserDto: CreateUserDto): Promise<User> {
    const user = this.userRepository.create(createUserDto);

    if (createUserDto.password) {
      user.password = await bcrypt.hash(createUserDto.password, 10);
    }

    return await this.userRepository.save(user);
  }

  async updateUser(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findUserById(id);

    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    Object.assign(user, updateUserDto);
    return await this.userRepository.save(user);
  }

  async deleteUser(id: number): Promise<void> {
    const user = await this.findUserById(id);
    await this.userRepository.remove(user);
  }

  // Chats CRUD
  async findAllChats(page = 1, limit = 50): Promise<{ data: Chat[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.chatRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['users', 'createdBy'],
    });
    return { data, total, page, limit };
  }

  async findChatById(id: string): Promise<Chat> {
    const chat = await this.chatRepository.findOne({
      where: { id },
      relations: ['users', 'createdBy', 'messages'],
    });
    if (!chat) {
      throw new NotFoundException(`Чат с ID ${id} не найден`);
    }
    return chat;
  }

  async createChat(createChatDto: CreateChatDto): Promise<Chat> {
    // Validate all users exist
    const users = await this.userRepository.find({
      where: { id: In(createChatDto.userIds) },
    });

    if (users.length !== createChatDto.userIds.length) {
      throw new NotFoundException('Один или несколько пользователей не найдены');
    }

    // Get creator if specified
    let createdBy: User | undefined;
    if (createChatDto.createdById) {
      createdBy = await this.findUserById(createChatDto.createdById);
    }

    // Generate unique key based on sorted user IDs
    const uniqueKey = createChatDto.userIds.sort((a, b) => a - b).join('_');

    const chat = this.chatRepository.create({
      type: createChatDto.type || 'private',
      name: createChatDto.name,
      description: createChatDto.description,
      uniqueKey,
      users,
      createdBy,
    });

    return await this.chatRepository.save(chat);
  }

  async deleteChat(id: string): Promise<void> {
    const chat = await this.findChatById(id);
    await this.chatRepository.remove(chat);
  }

  // Messages CRUD
  async findAllMessages(page = 1, limit = 50): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.messageRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['chat', 'sender', 'currentContent'],
    });
    return { data, total, page, limit };
  }

  async findMessageById(id: string): Promise<Message> {
    const message = await this.messageRepository.findOne({
      where: { id },
      relations: ['chat', 'sender', 'currentContent'],
    });
    if (!message) {
      throw new NotFoundException(`Сообщение с ID ${id} не найдено`);
    }
    return message;
  }

  async findMessagesByChatId(chatId: string, page = 1, limit = 50): Promise<{ data: Message[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.messageRepository.findAndCount({
      where: { chat: { id: chatId } },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['sender', 'currentContent'],
    });
    return { data, total, page, limit };
  }

  async createMessage(createMessageDto: CreateMessageDto): Promise<Message> {
    const chat = await this.findChatById(createMessageDto.chatId);
    const sender = await this.findUserById(createMessageDto.senderId);

    // Create message with content directly
    const message = this.messageRepository.create({
      chat,
      sender,
      content: createMessageDto.content,
      attachments: createMessageDto.attachments || [],
      type: createMessageDto.type || 'text',
      voiceUrl: createMessageDto.type === 'voice' ? createMessageDto.content : undefined,
    });

    return await this.messageRepository.save(message);
  }

  async updateMessage(id: string, updateMessageDto: UpdateMessageDto): Promise<Message> {
    const message = await this.findMessageById(id);

    if (updateMessageDto.chatId) {
      const chat = await this.findChatById(updateMessageDto.chatId);
      message.chat = chat;
    }

    if (updateMessageDto.senderId) {
      const sender = await this.findUserById(updateMessageDto.senderId);
      message.sender = sender;
    }

    if (updateMessageDto.content !== undefined) {
      message.content = updateMessageDto.content;
    }

    if (updateMessageDto.attachments !== undefined) {
      message.attachments = updateMessageDto.attachments;
    }

    if (updateMessageDto.type) {
      message.type = updateMessageDto.type;
      if (updateMessageDto.type === 'voice' && updateMessageDto.content) {
        message.voiceUrl = updateMessageDto.content;
      }
    }

    return await this.messageRepository.save(message);
  }

  async deleteMessage(id: string): Promise<void> {
    const message = await this.findMessageById(id);
    await this.messageRepository.remove(message);
  }

  // Reviews CRUD
  async findAllReviews(page = 1, limit = 50): Promise<{ data: Review[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.reviewRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
      relations: ['author', 'user'],
    });
    return { data, total, page, limit };
  }

  async findReviewById(id: number): Promise<Review> {
    const review = await this.reviewRepository.findOne({
      where: { id },
      relations: ['author', 'user'],
    });
    if (!review) {
      throw new NotFoundException(`Отзыв с ID ${id} не найден`);
    }
    return review;
  }

  async createReview(createReviewDto: CreateReviewDto): Promise<Review> {
    const author = await this.findUserById(createReviewDto.authorId);
    const user = await this.findUserById(createReviewDto.userId);

    const review = this.reviewRepository.create({
      content: createReviewDto.content,
      rank: createReviewDto.rank,
      images: createReviewDto.images || [],
      author,
      user,
      isVerified: createReviewDto.isVerified || false,
    });

    return await this.reviewRepository.save(review);
  }

  async updateReview(id: number, updateReviewDto: UpdateReviewDto): Promise<Review> {
    const review = await this.findReviewById(id);

    if (updateReviewDto.authorId) {
      const author = await this.findUserById(updateReviewDto.authorId);
      review.author = author;
    }

    if (updateReviewDto.userId) {
      const user = await this.findUserById(updateReviewDto.userId);
      review.user = user;
    }

    // If answer is being set for the first time, set answeredAt
    if (updateReviewDto.answer && !review.answer) {
      review.answeredAt = new Date();
    }

    Object.assign(review, updateReviewDto);
    return await this.reviewRepository.save(review);
  }

  async deleteReview(id: number): Promise<void> {
    const review = await this.findReviewById(id);
    await this.reviewRepository.remove(review);
  }

  // Statistics
  async getStatistics() {
    const [usersCount, chatsCount, messagesCount, reviewsCount] = await Promise.all([
      this.userRepository.count(),
      this.chatRepository.count(),
      this.messageRepository.count(),
      this.reviewRepository.count(),
    ]);

    return {
      users: usersCount,
      chats: chatsCount,
      messages: messagesCount,
      reviews: reviewsCount,
    };
  }
}
