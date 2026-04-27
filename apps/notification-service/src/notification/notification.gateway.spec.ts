import { Test, TestingModule } from '@nestjs/testing';
import { NotificationGateway } from './notification.gateway';
import { Server, Socket } from 'socket.io';
import { expect, beforeEach, describe, it, jest } from '@jest/globals';

const mockClient = (id: string): Socket => ({ id }) as unknown as Socket;

const mockServer = (size: number): Server =>
  ({ sockets: { sockets: { size } } }) as unknown as Server;

describe('NotificationGateway', () => {
  let gateway: NotificationGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NotificationGateway],
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
    it('logs client connect', () => {
      gateway.io = mockServer(1);
      const spy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleConnection(mockClient('abc'));
      expect(spy).toHaveBeenCalledWith('Client id: abc connected');
    });
  });

  describe('handleDisconnect', () => {
    it('logs client disconnect', () => {
      const spy = jest.spyOn(gateway['logger'], 'log');
      gateway.handleDisconnect(mockClient('abc'));
      expect(spy).toHaveBeenCalledWith('Cliend id:abc disconnected');
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
