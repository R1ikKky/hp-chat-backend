import { NestFactory } from '@nestjs/core';
import { ChatModule } from './chat.module';
import { IoAdapter } from '@nestjs/platform-socket.io';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(ChatModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.useWebSocketAdapter(new IoAdapter(app));

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.KAFKA,
    options: {
      client: {
        clientId: 'chat-service',
        brokers: [process.env.KAFKA_BROKER ?? 'localhost:9092'],
        allowAutoTopicCreation: true,
      },
      consumer: {
        groupId: 'chat-service',
      },
    },
  });

  await app.startAllMicroservices();
  await app.listen(process.env.CHAT_PORT ?? 3002);
}
void bootstrap();
