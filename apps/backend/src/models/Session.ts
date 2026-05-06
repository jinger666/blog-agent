import mongoose, { Document, Schema } from 'mongoose';

export interface ISession extends Document {
  id: string;
  userId: string;
  createdAt: Date;
  lastActiveAt: Date;
  context: Record<string, any>;
  messages?: Array<{
    role: 'user' | 'assistant' | 'system';
    content: string;
    timestamp: Date;
  }>;
}

const SessionSchema = new Schema<ISession>(
  {
    id: { type: String, required: true, unique: true, index: true },
    userId: { type: String, required: true, index: true },
    createdAt: { type: Date, default: Date.now },
    lastActiveAt: { type: Date, default: Date.now },
    context: { type: Schema.Types.Mixed, default: {} },
    messages: [
      {
        role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
        content: { type: String, required: true },
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Index for efficient queries
SessionSchema.index({ userId: 1, lastActiveAt: -1 });

export default mongoose.model<ISession>('Session', SessionSchema);
