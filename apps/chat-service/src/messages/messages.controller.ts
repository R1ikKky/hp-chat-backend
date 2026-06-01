import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UserId } from '@app/auth';
import { MessagesService } from './messages.service';
import { SendMessageDto } from './dto/send-message.dto';
import { EditMessageDto } from './dto/edit-message.dto';
import { MessagesQueryDto } from './dto/messages-query.dto';

@Controller('messages')
export class MessagesController {
  constructor(private readonly messagesService: MessagesService) {}

  @Get(':conversationId')
  getHistory(
    @UserId() userId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Query() query: MessagesQueryDto,
  ) {
    return this.messagesService.getHistory(conversationId, userId, query);
  }

  @Post(':conversationId')
  send(
    @UserId() userId: string,
    @Param('conversationId', ParseUUIDPipe) conversationId: string,
    @Body() dto: SendMessageDto,
  ) {
    return this.messagesService.send(conversationId, userId, dto);
  }

  @Patch(':messageId')
  edit(
    @UserId() userId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
    @Body() dto: EditMessageDto,
  ) {
    return this.messagesService.edit(messageId, userId, dto);
  }

  @Delete(':messageId')
  delete(
    @UserId() userId: string,
    @Param('messageId', ParseUUIDPipe) messageId: string,
  ) {
    return this.messagesService.softDelete(messageId, userId);
  }
}
