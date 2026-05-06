import mongoose, { Document, Schema } from 'mongoose';

export interface IMemory extends Document {
  id: string;
  userId: string;
  content: string;
  embedding: number[];
  category: 'fact' | 'preference' | 'history';
  importance: number;
  createdAt: Date;
  updatedAt: Date;
  accessedAt: Date;
  metadata?: Record<string, any>;
}

const MemorySchema = new Schema<IMemory>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    category: {
      type: String,
      enum: ['fact', 'preference', 'history'],
      required: true,
      index: true,
    },
    importance: { type: Number, required: true, default: 0.5, min: 0, max: 1, index: true },
    createdAt: { type: Date, default: Date.now, index: true },
    updatedAt: { type: Date, default: Date.now },
    accessedAt: { type: Date, default: Date.now, index: true },
    metadata: { type: Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
MemorySchema.index({ userId: 1, category: 1 });
MemorySchema.index({ userId: 1, importance: -1 });
MemorySchema.index({ userId: 1, createdAt: -1 });
MemorySchema.index({ userId: 1, accessedAt: -1 });

export default mongoose.model<IMemory>('Memory', MemorySchema);
