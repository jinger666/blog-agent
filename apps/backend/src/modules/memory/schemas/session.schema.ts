import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SessionDocument = Session & Document;

@Schema()
export class Message {
  @Prop({ required: true, enum: ['user', 'assistant', 'system'] })
  role: string;

  @Prop({ required: true })
  content: string;

  @Prop({ default: Date.now })
  timestamp: Date;
}

export const MessageSchema = SchemaFactory.createForClass(Message);

@Schema({ timestamps: true })
export class Session {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ default: Date.now })
  createdAt: Date;

  @Prop({ default: Date.now })
  lastActiveAt: Date;

  @Prop({ type: Object, default: {} })
  context: Record<string, any>;

  @Prop({ type: [MessageSchema], default: [] })
  messages?: Message[];
}

export const SessionSchema = SchemaFactory.createForClass(Session);

// Index
SessionSchema.index({ userId: 1, lastActiveAt: -1 });
