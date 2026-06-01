import { Logger } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { AuthService } from '@app/auth';
import { ConversationsService } from '../conversations/conversations.service';
import { MessagesService } from '../messages/messages.service';
import { PresenceService } from '../presence/presence.service';
import { RedisService } from '../providers/redis/redis.service';
import { SendMessageDto } from '../messages/dto/send-message.dto';

interface SocketData {
  userId: string;
  userLogin: string;
}

@WebSocketGateway({ cors: { origin: '*' } })
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(ChatGateway.name);

  constructor(
    private readonly authService: AuthService,
    private readonly conversationsService: ConversationsService,
    private readonly messagesService: MessagesService,
    private readonly presenceService: PresenceService,
    private readonly redisService: RedisService,
  ) {}

  @WebSocketServer() server!: Server;

  afterInit() {
    this.logger.log('Chat WebSocket gateway initialized');
  }

  async handleConnection(client: Socket) {
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) throw new Error('Missing authorization');

      const payload = this.authService.verifyJwtPayload(authHeader);
      (client.data as SocketData).userId = payload.userId;
      (client.data as SocketData).userLogin = payload.userLogin;

      const convIds = await this.conversationsService.getUserConversationIds(
        payload.userId,
      );
      for (const id of convIds) {
        void client.join(`conv:${id}`);
      }

      await this.presenceService.setOnline(payload.userId);
      this.server.emit('presence:changed', {
        userId: payload.userId,
        userLogin: payload.userLogin,
        status: 'online',
      });

      this.logger.log(`Client connected: ${client.id} (${payload.userLogin})`);
    } catch {
      client.disconnect();
    }
  }

  async handleDisconnect(client: Socket) {
    const data = client.data as SocketData;
    if (data.userId) {
      await this.presenceService.setOffline(data.userId);
      this.server.emit('presence:changed', {
        userId: data.userId,
        userLogin: data.userLogin,
        status: 'offline',
      });
    }
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('message:send')
  async handleSendMessage(
    client: Socket,
    payload: { conversationId: string } & SendMessageDto,
  ) {
    const data = client.data as SocketData;
    const message = await this.messagesService.send(
      payload.conversationId,
      data.userId,
      {
        content: payload.content,
        type: payload.type,
        replyTo: payload.replyTo,
      },
    );

    this.server.to(`conv:${payload.conversationId}`).emit('message:new', {
      message: { ...message, senderLogin: data.userLogin },
    });

    return { event: 'message:sent', data: message };
  }

  @SubscribeMessage('message:edit')
  async handleEditMessage(
    client: Socket,
    payload: { messageId: string; content: string },
  ) {
    const data = client.data as SocketData;
    const message = await this.messagesService.edit(
      payload.messageId,
      data.userId,
      {
        content: payload.content,
      },
    );

    this.server.to(`conv:${message.conversationId}`).emit('message:updated', {
      messageId: message.id,
      conversationId: message.conversationId,
      content: message.content,
      isEdited: true,
    });

    return { event: 'message:edited', data: message };
  }

  @SubscribeMessage('message:delete')
  async handleDeleteMessage(client: Socket, payload: { messageId: string }) {
    const data = client.data as SocketData;
    const message = await this.messagesService.softDelete(
      payload.messageId,
      data.userId,
    );

    this.server.to(`conv:${message.conversationId}`).emit('message:deleted', {
      messageId: message.id,
      conversationId: message.conversationId,
    });

    return { event: 'message:deleted', data: { messageId: message.id } };
  }

  @SubscribeMessage('typing:start')
  async handleTypingStart(client: Socket, payload: { conversationId: string }) {
    const data = client.data as SocketData;
    await this.redisService.set(
      `chat:typing:${payload.conversationId}:${data.userId}`,
      1,
      3,
    );

    client.to(`conv:${payload.conversationId}`).emit('typing:update', {
      conversationId: payload.conversationId,
      userId: data.userId,
      userLogin: data.userLogin,
      isTyping: true,
    });
  }

  @SubscribeMessage('typing:stop')
  async handleTypingStop(client: Socket, payload: { conversationId: string }) {
    const data = client.data as SocketData;
    await this.redisService.del(
      `chat:typing:${payload.conversationId}:${data.userId}`,
    );

    client.to(`conv:${payload.conversationId}`).emit('typing:update', {
      conversationId: payload.conversationId,
      userId: data.userId,
      userLogin: data.userLogin,
      isTyping: false,
    });
  }

  @SubscribeMessage('message:read')
  handleMessageRead(
    client: Socket,
    payload: { conversationId: string; messageId: string },
  ) {
    const data = client.data as SocketData;

    client.to(`conv:${payload.conversationId}`).emit('message:read', {
      conversationId: payload.conversationId,
      userId: data.userId,
      messageId: payload.messageId,
    });
  }

  @SubscribeMessage('presence:heartbeat')
  async handleHeartbeat(client: Socket) {
    const data = client.data as SocketData;
    if (data.userId) {
      await this.presenceService.setOnline(data.userId);
    }
  }
}
