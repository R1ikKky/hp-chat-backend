import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ConversationsModule } from '../conversations/conversations.module';
import { MessagesModule } from '../messages/messages.module';
import { PresenceModule } from '../presence/presence.module';

@Module({
  imports: [ConversationsModule, MessagesModule, PresenceModule],
  providers: [ChatGateway],
})
export class GatewayModule {}
