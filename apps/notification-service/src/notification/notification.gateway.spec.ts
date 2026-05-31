import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { AuthService } from '@app/auth';
import { getModelToken } from '@nestjs/mongoose';
import { Notification } from '../schemas/notification.schema';
import { Server, Socket } from 'socket.io';
import { expect, beforeEach, describe, it, jest } from '@jest/globals';

const mockClient = (id: string): Socket => ({ id }) as unknown as Socket;

const mockServer = (size: number): Server =>
  ({ sockets: { sockets: { size } } }) as unknown as Server;

const mockAuthService = {
  verifyJwt: jest.fn<() => string>().mockReturnValue('user-123'),
};

const mockNotificationModel = {
  create: jest.fn().mockResolvedValue({}),
};

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationGateway,
        { provide: AuthService, useValue: mockAuthService },
        {
          provide: getModelToken(Notification.name),
          useValue: mockNotificationModel,
        },
      ],
    }).compile();

    gateway = module.get<NotificationGateway>(NotificationGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });

  describe('afterInit', () => {
    it('logs initialization', () => {
      const spy = jest.spyOn(gateway['logger'], 'log');
      gateway.afterInit();
      expect(spy).toHaveBeenCalledWith('WebSocketGateway initialized');
    });
  });

  describe('handleConnection', () => {
    it('joins room with userId when token valid', () => {
      const client = {
        id: 'abc',
        data: {},
        handshake: { headers: { authorization: 'Bearer valid-token' } },
        join: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;
      gateway.io = mockServer(1);

      gateway.handleConnection(client);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.join).toHaveBeenCalledWith('user-123');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.disconnect).not.toHaveBeenCalled();
    });

    it('disconnects when no auth header', () => {
      const client = {
        id: 'abc',
        data: {},
        handshake: { headers: {} },
        join: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;
      gateway.io = mockServer(1);

      gateway.handleConnection(client);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.disconnect).toHaveBeenCalled();
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.join).not.toHaveBeenCalled();
    });

    it('disconnects when token invalid', () => {
      mockAuthService.verifyJwt.mockImplementationOnce(() => {
        throw new Error('invalid token');
      });
      const client = {
        id: 'abc',
        data: {},
        handshake: { headers: { authorization: 'Bearer bad-token' } },
        join: jest.fn(),
        disconnect: jest.fn(),
      } as unknown as Socket;
      gateway.io = mockServer(1);

      gateway.handleConnection(client);

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(client.disconnect).toHaveBeenCalled();
    });
  });

  describe('handleDisconnect', () => {
    it('logs client disconnect', () => {
      const spy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockClient('abc'));
      expect(spy).toHaveBeenCalledWith('Client id:abc disconnected');
    });
  });

  describe('sendNotification', () => {
    it('emits notification to sender and receiver rooms and returns ok', () => {
      const emitMock = jest.fn();
      gateway.io = {
        to: jest.fn().mockReturnValue({ emit: emitMock }),
      } as unknown as Server;

      const result = gateway.sendNotification({
        senderLogin: 'user-123',
        receiverLogin: 'user-456',
        amount: 100,
      });

      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.io.to).toHaveBeenCalledWith('user-123');
      // eslint-disable-next-line @typescript-eslint/unbound-method
      expect(gateway.io.to).toHaveBeenCalledWith('user-456');
      expect(emitMock).toHaveBeenCalledWith(
        'notification',
        expect.objectContaining({ data: expect.any(String) }),
      );
      expect(result).toBe('ok');
    });
  });

  describe('handleMessage', () => {
    it('returns pong event', () => {
      const result = gateway.handleMessage(mockClient('abc'), 'hello');
      expect(result.event).toBe('pong');
    });

    it('logs received message', () => {
      const spy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleMessage(mockClient('abc'), 'hello');
      expect(spy).toHaveBeenCalledWith('Message received from client id: abc');
    });
  });
});
