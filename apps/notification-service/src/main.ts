import { NestFactory } from '@nestjs/core';
import { NotificationServiceModule } from './notification-service.module';
import { IoAdapter } from '@nestjs/platform-socket.io';

async function bootstrap() {
  const app = await NestFactory.create(NotificationServiceModule);
  app.useWebSocketAdapter(new IoAdapter(app));
  await app.listen(process.env.port ?? 3000);
}
void bootstrap();
