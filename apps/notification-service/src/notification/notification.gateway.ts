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
import { TransferCompletedEvent } from '../dto/transfer-completed.event';
import { InjectModel } from '@nestjs/mongoose';
import { Notification } from '../schemas/notification.schema';
import { Model } from 'mongoose';

@WebSocketGateway({ cors: { origin: '*' } })
export class NotificationGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  private readonly logger = new Logger(NotificationGateway.name);

  constructor(
    private readonly authService: AuthService,
    @InjectModel(Notification.name)
    private readonly notificationModel: Model<Notification>,
  ) {}
  @WebSocketServer() io!: Server;

  afterInit() {
    this.logger.log('WebSocketGateway initialized');
  }

  handleConnection(client: Socket) {
    this.logger.log(`Client connected: ${client.id}`);

    let userLogin: string;
    try {
      const authHeader = client.handshake.headers.authorization;
      if (!authHeader) {
        throw new Error('invalid token');
      }
      userLogin = this.authService.verifyJwt(authHeader);
      (client.data as { userLogin: string }).userLogin = userLogin;
    } catch {
      client.disconnect();
      return;
    }
    void client.join(userLogin);
    this.logger.debug(
      `Number of connected clients: ${this.io.sockets.sockets.size}`,
    );
  }

  handleDisconnect(client: Socket) {
    this.logger.log(`Client id:${client.id} disconnected`);
  }

  sendNotification({
    senderLogin,
    receiverLogin,
    amount,
  }: TransferCompletedEvent): string {
    this.io.to(senderLogin).emit('notification', {
      data: `u sent ${amount} amount of money to ${receiverLogin}`,
    });

    this.io.to(receiverLogin).emit('notification', {
      data: `u recieved ${amount} amount of money from ${senderLogin}`,
    });

    void this.notificationModel.create({ senderLogin, receiverLogin, amount });

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
