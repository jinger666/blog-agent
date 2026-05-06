import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MemoryDocument = Memory & Document;

@Schema({ timestamps: true })
export class Memory {
  @Prop({ required: true, unique: true, index: true })
  id: string;

  @Prop({ required: true, index: true })
  userId: string;

  @Prop({ required: true })
  content: string;

  @Prop({ type: [Number], required: true })
  embedding: number[];

  @Prop({ 
    required: true, 
    enum: ['fact', 'preference', 'history'],
    index: true 
  })
  category: string;

  @Prop({ 
    required: true, 
    default: 0.5, 
    min: 0, 
    max: 1,
    index: true 
  })
  importance: number;

  @Prop({ default: Date.now, index: true })
  createdAt: Date;

  @Prop({ default: Date.now })
  updatedAt: Date;

  @Prop({ default: Date.now, index: true })
  accessedAt: Date;

  @Prop({ type: Object, default: {} })
  metadata?: Record<string, any>;
}

export const MemorySchema = SchemaFactory.createForClass(Memory);

// Indexes
MemorySchema.index({ userId: 1, category: 1 });
MemorySchema.index({ userId: 1, importance: -1 });
MemorySchema.index({ userId: 1, createdAt: -1 });
MemorySchema.index({ userId: 1, accessedAt: -1 });
