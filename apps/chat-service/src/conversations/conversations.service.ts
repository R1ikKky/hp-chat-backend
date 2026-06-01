import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import {
  ConversationEntity,
  ConversationType,
} from './entities/conversation.entity';
import {
  ConversationParticipantEntity,
  ParticipantRole,
} from './entities/conversation-participant.entity';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';

@Injectable()
export class ConversationsService {
  private readonly logger = new Logger(ConversationsService.name);

  constructor(
    @InjectRepository(ConversationEntity)
    private readonly conversationRepo: Repository<ConversationEntity>,
    @InjectRepository(ConversationParticipantEntity)
    private readonly participantRepo: Repository<ConversationParticipantEntity>,
    private readonly dataSource: DataSource,
  ) {}

  async create(
    userId: string,
    dto: CreateConversationDto,
  ): Promise<ConversationEntity> {
    if (dto.type === ConversationType.DIRECT) {
      if (dto.participantIds.length !== 1) {
        throw new BadRequestException(
          'Direct conversation requires exactly 1 other participant',
        );
      }

      const existing = await this.findDirectConversation(
        userId,
        dto.participantIds[0],
      );
      if (existing) return existing;
    }

    return this.dataSource.transaction(async (manager) => {
      const conversation = manager.create(ConversationEntity, {
        type: dto.type,
        name: dto.name ?? null,
        avatarUrl: null,
        createdBy: userId,
      });
      await manager.save(conversation);

      const allParticipantIds = [userId, ...dto.participantIds];
      const participants = allParticipantIds.map((pId) =>
        manager.create(ConversationParticipantEntity, {
          conversationId: conversation.id,
          userId: pId,
          role: pId === userId ? ParticipantRole.OWNER : ParticipantRole.MEMBER,
        }),
      );
      await manager.save(participants);

      conversation.participants = participants;
      return conversation;
    });
  }

  async getUserConversations(userId: string): Promise<ConversationEntity[]> {
    return this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'cp', 'cp.userId = :userId', { userId })
      .leftJoinAndSelect('c.participants', 'allP')
      .orderBy('c.updatedAt', 'DESC')
      .getMany();
  }

  async getUserConversationIds(userId: string): Promise<string[]> {
    const rows = await this.participantRepo.find({
      where: { userId },
      select: ['conversationId'],
    });
    return rows.map((r) => r.conversationId);
  }

  async getById(
    conversationId: string,
    userId: string,
  ): Promise<ConversationEntity> {
    await this.assertParticipant(conversationId, userId);
    const conversation = await this.conversationRepo.findOne({
      where: { id: conversationId },
      relations: ['participants'],
    });
    if (!conversation) throw new NotFoundException('Conversation not found');
    return conversation;
  }

  async update(
    conversationId: string,
    userId: string,
    dto: UpdateConversationDto,
  ): Promise<ConversationEntity> {
    await this.assertParticipantRole(conversationId, userId, [
      ParticipantRole.OWNER,
      ParticipantRole.ADMIN,
    ]);
    await this.conversationRepo.update(conversationId, dto);
    return this.getById(conversationId, userId);
  }

  async addMember(
    conversationId: string,
    userId: string,
    newUserId: string,
  ): Promise<void> {
    const conversation = await this.getById(conversationId, userId);
    if (conversation.type === ConversationType.DIRECT) {
      throw new BadRequestException(
        'Cannot add members to direct conversation',
      );
    }
    await this.assertParticipantRole(conversationId, userId, [
      ParticipantRole.OWNER,
      ParticipantRole.ADMIN,
    ]);

    const existing = await this.participantRepo.findOne({
      where: { conversationId, userId: newUserId },
    });
    if (existing) throw new BadRequestException('User already in conversation');

    await this.participantRepo.save({
      conversationId,
      userId: newUserId,
      role: ParticipantRole.MEMBER,
    });
  }

  async removeMember(
    conversationId: string,
    userId: string,
    targetUserId: string,
  ): Promise<void> {
    if (userId !== targetUserId) {
      await this.assertParticipantRole(conversationId, userId, [
        ParticipantRole.OWNER,
        ParticipantRole.ADMIN,
      ]);
    }
    const result = await this.participantRepo.delete({
      conversationId,
      userId: targetUserId,
    });
    if (result.affected === 0)
      throw new NotFoundException('Participant not found');
  }

  async assertParticipant(
    conversationId: string,
    userId: string,
  ): Promise<void> {
    const exists = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!exists)
      throw new ForbiddenException('Not a participant of this conversation');
  }

  private async assertParticipantRole(
    conversationId: string,
    userId: string,
    roles: ParticipantRole[],
  ): Promise<void> {
    const participant = await this.participantRepo.findOne({
      where: { conversationId, userId },
    });
    if (!participant)
      throw new ForbiddenException('Not a participant of this conversation');
    if (!roles.includes(participant.role)) {
      throw new ForbiddenException('Insufficient role');
    }
  }

  private async findDirectConversation(
    userId1: string,
    userId2: string,
  ): Promise<ConversationEntity | null> {
    return this.conversationRepo
      .createQueryBuilder('c')
      .innerJoin('c.participants', 'cp1', 'cp1.userId = :userId1', { userId1 })
      .innerJoin('c.participants', 'cp2', 'cp2.userId = :userId2', { userId2 })
      .leftJoinAndSelect('c.participants', 'allP')
      .where('c.type = :type', { type: ConversationType.DIRECT })
      .getOne();
  }
}
