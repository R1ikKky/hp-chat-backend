import { AuthService } from '@app/auth';
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
import { TransferCompletedEvent } from '../transfer-completed.event';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly authService: AuthService) {}
  @WebSocketServer() io!: Server;

  afterInit() {
    this.logger.log('WebSocketGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    let userId: string;
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new Error('invalid token');
      }
      userId = this.authService.verifyJwt(authHeader);
      (client.data as { userId: string }).userId = userId;
    } catch {
      client.disconnect();
      return;
    }
    void client.join(userId);
    this.logger.debug(
      `Number of connected clients: ${this.io.sockets.sockets.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  sendNotification({
    senderId,
    receiverId,
    amount,
  }: TransferCompletedEvent): string {
    this.io.to(senderId).emit('notification', {
      data: `u sent ${amount} amount of money to ${receiverId}`,
    });

    this.io.to(receiverId).emit('notification', {
      data: `u recieved ${amount} amount of money from ${senderId}`,
    });

    return 'ok';
  }

  @SubscribeMessage('ping')
  handleMessage(
    client: Socket,
    payload: string,
  ): { event: string; data: string } {
    this.logger.log(`Message received from client id: ${client.id}`);
    this.logger.debug(`Payload: ${payload}`);
    return {
      event: 'pong',
      data: 'Wrong data that will make the test fail',
    };
  }
}
