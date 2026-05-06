import mongoose, { Document, Schema } from 'mongoose';
import { logger } from '../../utils/logger';

export interface IDocumentChunk extends Document {
  chunkId: string;
  documentId: string;
  content: string;
  embedding: number[];
  metadata: Record<string, any>;
  createdAt: Date;
}

const DocumentChunkSchema = new Schema<IDocumentChunk>({
  chunkId: { type: String, required: true, unique: true, index: true },
  documentId: { type: String, required: true, index: true },
  content: { type: String, required: true },
  embedding: { type: [Number], required: true },
  metadata: { type: Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now },
});

// Index for efficient queries
DocumentChunkSchema.index({ documentId: 1 });
DocumentChunkSchema.index({ chunkId: 1 });

export default mongoose.model<IDocumentChunk>('DocumentChunk', DocumentChunkSchema);
