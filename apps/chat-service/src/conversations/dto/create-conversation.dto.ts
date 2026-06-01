import { IsArray, IsEnum, IsOptional, IsString, IsUUID } from 'class-validator';
import { ConversationType } from '../entities/conversation.entity';

export class CreateConversationDto {
  @IsEnum(ConversationType)
  type!: ConversationType;

  @IsOptional()
  @IsString()
  name?: string;

  @IsArray()
  @IsUUID('4', { each: true })
  participantIds!: string[];
}
