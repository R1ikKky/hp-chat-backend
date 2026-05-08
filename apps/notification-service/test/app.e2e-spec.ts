import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { JwtService } from '@nestjs/jwt';
import { io, Socket } from 'socket.io-client';
import { afterAll, beforeAll, describe, expect, it } from '@jest/globals';
import { NotificationServiceModule } from '../src/notification.module';
import { NotificationGateway } from '../src/notification/notification.gateway';

const TEST_PORT = 3099;
const WS_URL = `http://localhost:${TEST_PORT}`;

function wsConnect(token: string): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const client = io(WS_URL, {
      extraHeaders: { authorization: `Bearer ${token}` },
      reconnection: false,
    });
    client.once('connect', () => resolve(client));
    client.once('connect_error', reject);
  });
}

describe('Notification E2E', () => {
  let app: INestApplication;
  let gateway: NotificationGateway;
  let jwtService: JwtService;
  const USER_A = 'user-a-id';
  const USER_B = 'user-b-id';

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [NotificationServiceModule],
    }).compile();

    app = module.createNestApplication();
    app.useWebSocketAdapter(new IoAdapter(app));
    await app.init();
    await app.listen(TEST_PORT);

    gateway = module.get(NotificationGateway);
    jwtService = module.get(JwtService);
  });

  afterAll(async () => {
    await app.close();
  });

  it('rejects connection without token', (done) => {
    const client = io(WS_URL, { reconnection: false });
    client.once('disconnect', () => {
      client.close();
      done();
    });
    client.once('connect_error', () => {
      client.close();
      done();
    });
  });

  it('rejects connection with invalid token', (done) => {
    const client = io(WS_URL, {
      extraHeaders: { authorization: 'Bearer bad.token.here' },
      reconnection: false,
    });
    client.once('disconnect', () => {
      client.close();
      done();
    });
    client.once('connect_error', () => {
      client.close();
      done();
    });
  });

  it('accepts connection with valid JWT and receives notification', async () => {
    const tokenB = jwtService.sign({ userId: USER_B, userRole: 'user' });
    const clientB = await wsConnect(tokenB);

    const received = await new Promise<{ data: string }>((resolve) => {
      clientB.once('notification', resolve);
      gateway.sendNotification({
        senderId: USER_A,
        receiverId: USER_B,
        amount: 100,
      });
    });

    expect(received.data).toContain(USER_A);
    clientB.disconnect();
  });

  it('routes notification to both parties, not to unrelated user', async () => {
    const USER_C = 'user-c-id';
    const tokenA = jwtService.sign({ userId: USER_A, userRole: 'user' });
    const tokenB = jwtService.sign({ userId: USER_B, userRole: 'user' });
    const tokenC = jwtService.sign({ userId: USER_C, userRole: 'user' });
    const [clientA, clientB, clientC] = await Promise.all([
      wsConnect(tokenA),
      wsConnect(tokenB),
      wsConnect(tokenC),
    ]);

    const aReceived = new Promise<boolean>((resolve) => {
      clientA.once('notification', () => resolve(true));
    });
    const bReceived = new Promise<boolean>((resolve) => {
      clientB.once('notification', () => resolve(true));
    });
    const cReceivedWrong = new Promise<boolean>((resolve) => {
      clientC.once('notification', () => resolve(true));
      setTimeout(() => resolve(false), 500);
    });

    gateway.sendNotification({ senderId: USER_A, receiverId: USER_B, amount: 50 });

    const [aGot, bGot, cGotWrong] = await Promise.all([
      aReceived,
      bReceived,
      cReceivedWrong,
    ]);

    expect(aGot).toBe(true);
    expect(bGot).toBe(true);
    expect(cGotWrong).toBe(false);

    clientA.disconnect();
    clientB.disconnect();
    clientC.disconnect();
  });
});
