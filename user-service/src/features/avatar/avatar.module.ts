import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AvatarEntity } from './entities/avatar.entity';
import { AvatarService } from './avatar.service';
import { AvatarController } from './avatar.controller';
import { FilesModule } from '../../providers/files/files.module';
import { avatarRepositoryProvider } from './dto/avatar-repository.provider';

@Module({
  imports: [TypeOrmModule.forFeature([AvatarEntity]), FilesModule],
  providers: [AvatarService, avatarRepositoryProvider],
  controllers: [AvatarController],
  exports: [AvatarService],
})
export class AvatarModule {}
