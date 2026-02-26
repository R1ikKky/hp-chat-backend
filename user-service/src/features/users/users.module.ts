import { Module } from '@nestjs/common';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { usersRepositoryProvider } from './dto/users-repository.provider';
import { ProvidersModule } from '../../providers/providers.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { refreshTokenEntity } from '../../auth/entities/refresh-token.entity';
import { AuthGuard } from '../../guards/auth.guard';
import { refreshTokenRepositoryProvider } from '../../auth/dto/refresh-token-repository.provider';
import { AvatarEntity } from '../avatar/entities/avatar.entity';
import { avatarRepositoryProvider } from '../avatar/dto/avatar-repository.provider';

@Module({
  imports: [
    ProvidersModule,
    TypeOrmModule.forFeature([UsersEntity, refreshTokenEntity, AvatarEntity]),
  ],
  providers: [
    UsersService,
    usersRepositoryProvider,
    refreshTokenRepositoryProvider,
    avatarRepositoryProvider,
    AuthGuard,
  ],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
