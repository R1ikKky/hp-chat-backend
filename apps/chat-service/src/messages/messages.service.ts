import {
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MessageEntity, MessageType } from './entities/message.entity';
import { ConversationsService } from '../conversations/conversations.service';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

@Injectable()
export class MessagesService {
  private readonly logger = new Logger(MessagesService.name);

  constructor(
    @InjectRepository(MessageEntity)
    private readonly messageRepo: Repository<MessageEntity>,
    private readonly conversationsService: ConversationsService,
  ) {}

  async send(
    conversationId: string,
    senderId: string,
    dto: SendMessageDto,
  ): Promise<MessageEntity> {
    await this.conversationsService.assertParticipant(conversationId, senderId);

    const message = this.messageRepo.create({
      conversationId,
      senderId,
      content: dto.content,
      type: dto.type ?? MessageType.TEXT,
      replyTo: dto.replyTo ?? null,
    });

    return this.messageRepo.save(message);
  }

  async getHistory(
    conversationId: string,
    userId: string,
    query: MessagesQueryDto,
  ): Promise<{
    data: MessageEntity[];
    hasNext: boolean;
    nextCursor: string | null;
  }> {
    await this.conversationsService.assertParticipant(conversationId, userId);

    const limit = query.limit ?? 50;

    const qb = this.messageRepo
      .createQueryBuilder('m')
      .leftJoinAndSelect('m.attachments', 'a')
      .where('m.conversationId = :conversationId', { conversationId })
      .orderBy('m.sentAt', 'DESC')
      .take(limit + 1);

    if (query.cursor) {
      const cursorMessage = await this.messageRepo.findOne({
        where: { id: query.cursor },
      });
      if (cursorMessage) {
        qb.andWhere('m.sentAt < :sentAt', { sentAt: cursorMessage.sentAt });
      }
    }

    const messages = await qb.getMany();
    const hasNext = messages.length > limit;
    if (hasNext) messages.pop();

    return {
      data: messages,
      hasNext,
      nextCursor:
        hasNext && messages.length > 0
          ? messages[messages.length - 1].id
          : null,
    };
  }

  async edit(
    messageId: string,
    userId: string,
    dto: EditMessageDto,
  ): Promise<MessageEntity> {
    const message = await this.findOwnMessage(messageId, userId);
    message.content = dto.content;
    message.isEdited = true;
    message.editedAt = new Date();
    return this.messageRepo.save(message);
  }

  async softDelete(messageId: string, userId: string): Promise<MessageEntity> {
    const message = await this.findOwnMessage(messageId, userId);
    message.isDeleted = true;
    message.content = '';
    return this.messageRepo.save(message);
  }

  private async findOwnMessage(
    messageId: string,
    userId: string,
  ): Promise<MessageEntity> {
    const message = await this.messageRepo.findOne({
      where: { id: messageId },
    });
    if (!message) throw new NotFoundException('Message not found');
    if (message.senderId !== userId)
      throw new ForbiddenException('Not your message');
    return message;
  }
}
