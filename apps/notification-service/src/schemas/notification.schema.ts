import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';

export type NotificationDocument = HydratedDocument<Notification>;

@Schema({ timestamps: { createdAt: true, updatedAt: false } })
export class Notification {
  @Prop({ required: true })
  senderLogin!: string;

  @Prop({ required: true })
  receiverLogin!: string;

  @Prop({ required: true })
  amount!: number;

  createdAt!: Date;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);
