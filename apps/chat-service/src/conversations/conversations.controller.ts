import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import { UserId } from '@app/auth';
import { ConversationsService } from './conversations.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { UpdateConversationDto } from './dto/update-conversation.dto';
import { AddMemberDto } from './dto/add-member.dto';

@Controller('conversations')
export class ConversationsController {
  constructor(private readonly conversationsService: ConversationsService) {}

  @Post()
  create(@UserId() userId: string, @Body() dto: CreateConversationDto) {
    return this.conversationsService.create(userId, dto);
  }

  @Get()
  getMyConversations(@UserId() userId: string) {
    return this.conversationsService.getUserConversations(userId);
  }

  @Get(':id')
  getById(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.conversationsService.getById(id, userId);
  }

  @Patch(':id')
  update(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateConversationDto,
  ) {
    return this.conversationsService.update(id, userId, dto);
  }

  @Post(':id/members')
  addMember(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: AddMemberDto,
  ) {
    return this.conversationsService.addMember(id, userId, dto.userId);
  }

  @Delete(':id/members/:memberId')
  removeMember(
    @UserId() userId: string,
    @Param('id', ParseUUIDPipe) id: string,
    @Param('memberId', ParseUUIDPipe) memberId: string,
  ) {
    return this.conversationsService.removeMember(id, userId, memberId);
  }

  @Delete(':id')
  leave(@UserId() userId: string, @Param('id', ParseUUIDPipe) id: string) {
    return this.conversationsService.removeMember(id, userId, userId);
  }
}
