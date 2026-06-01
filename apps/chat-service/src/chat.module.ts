import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from '@app/auth';
import { ConversationsModule } from './conversations/conversations.module';
import { MessagesModule } from './messages/messages.module';
import { GatewayModule } from './gateway/gateway.module';
import { PresenceModule } from './presence/presence.module';
import { RedisModule } from './providers/redis/redis.module';
import { ConversationEntity } from './conversations/entities/conversation.entity';
import { ConversationParticipantEntity } from './conversations/entities/conversation-participant.entity';
import { MessageEntity } from './messages/entities/message.entity';
import { MessageAttachmentEntity } from './messages/entities/message-attachment.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST ?? 'localhost',
      port: parseInt(process.env.DB_PORT ?? '5432', 10),
      username: process.env.DB_USERNAME ?? 'rick',
      password: process.env.DB_PASSWORD ?? 'rick',
      database: process.env.DB_NAME ?? 'user-service',
      entities: [
        ConversationEntity,
        ConversationParticipantEntity,
        MessageEntity,
        MessageAttachmentEntity,
      ],
      synchronize: false,
    }),
    AuthModule,
    RedisModule,
    ConversationsModule,
    MessagesModule,
    GatewayModule,
    PresenceModule,
  ],
})
export class ChatModule {}
