import mongoose from 'mongoose';
import { documentProcessor, DocumentData, DocumentChunk as ChunkType } from './documentProcessor';
import { logger } from '../../utils/logger';
import { v4 as uuidv4 } from 'uuid';

// Define schema inline for legacy agent code
const DocumentChunkSchema = new mongoose.Schema(
  {
    chunkId: { type: String, required: true, unique: true },
    documentId: { type: String, required: true, index: true },
    content: { type: String, required: true },
    embedding: { type: [Number], required: true },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  },
  {
    timestamps: true,
  }
);

DocumentChunkSchema.index({ documentId: 1 });

const DocumentChunk = (mongoose.models.DocumentChunk || mongoose.model('DocumentChunk', DocumentChunkSchema)) as any;

export interface RAGQueryResult {
  answer: string;
  sources: Array<{
    content: string;
    metadata: Record<string, any>;
    similarity: number;
  }>;
}

class RAGSystem {
  async indexDocument(doc: DocumentData): Promise<number> {
    try {
      logger.info(`Indexing document: ${doc.id}`);

      // Process document into chunks
      const chunks = await documentProcessor.processDocument(doc);

      // Generate embeddings
      const chunksWithEmbeddings = await documentProcessor.generateEmbeddings(chunks);

      // Store in database
      const documents = chunksWithEmbeddings.map(chunk => ({
        chunkId: chunk.id,
        documentId: doc.id,
        content: chunk.content,
        embedding: chunk.embedding!,
        metadata: chunk.metadata,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));

      await DocumentChunk.insertMany(documents);

      logger.info(`Indexed ${documents.length} chunks for document ${doc.id}`);
      return documents.length;
    } catch (error) {
      logger.error(`Error indexing document ${doc.id}:`, error);
      throw error;
    }
  }

  async query(
    queryText: string,
    options: {
      topK?: number;
      userId?: string;
    } = {}
  ): Promise<RAGQueryResult> {
    try {
      const { topK = 5 } = options;

      logger.info(`RAG query: "${queryText.substring(0, 50)}..."`);

      // Generate query embedding
      const queryEmbedding = this.generatePlaceholderEmbedding(queryText);

      // Simple text-based search (in production, use vector similarity)
      const chunks = await DocumentChunk.find({})
        .limit(topK * 2)
        .lean();

      // Rank by relevance
      const queryTerms = queryText.toLowerCase().split(/\s+/);
      const ranked = chunks
        .map(chunk => {
          const content = chunk.content.toLowerCase();
          const matchCount = queryTerms.filter(term => content.includes(term)).length;
          const similarity = matchCount / queryTerms.length;
          
          return {
            chunk,
            similarity,
          };
        })
        .filter(result => result.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, topK);

      if (ranked.length === 0) {
        return {
          answer: 'No relevant documents found.',
          sources: [],
        };
      }

      // Build context from top results
      const context = ranked
        .map(r => r.chunk.content)
        .join('\n\n');

      // TODO: Use LLM to generate answer with context
      const answer = `Based on the retrieved documents:

${context}

[This is a simplified response. In production, an LLM would synthesize a proper answer using this context.]`;

      const sources = ranked.map(r => ({
        content: r.chunk.content,
        metadata: r.chunk.metadata,
        similarity: r.similarity,
      }));

      logger.info(`RAG query returned ${sources.length} sources`);

      return {
        answer,
        sources,
      };
    } catch (error) {
      logger.error('Error in RAG query:', error);
      throw error;
    }
  }

  async removeDocument(documentId: string): Promise<number> {
    try {
      const result = await DocumentChunk.deleteMany({ documentId });
      logger.info(`Removed ${result.deletedCount} chunks for document ${documentId}`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Error removing document ${documentId}:`, error);
      throw error;
    }
  }

  async getStats(): Promise<{
    totalDocuments: number;
    totalChunks: number;
  }> {
    try {
      const totalChunks = await DocumentChunk.countDocuments();
      
      const documents = await DocumentChunk.aggregate([
        { $group: { _id: '$documentId' } },
        { $count: 'totalDocuments' },
      ]);

      return {
        totalDocuments: documents[0]?.totalDocuments || 0,
        totalChunks,
      };
    } catch (error) {
      logger.error('Error getting RAG stats:', error);
      return {
        totalDocuments: 0,
        totalChunks: 0,
      };
    }
  }

  private generatePlaceholderEmbedding(text: string): number[] {
    // Simple hash-based placeholder (NOT for production use)
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 100; i++) {
      vector[i % 1536] += text.charCodeAt(i) / 1000;
    }
    return vector;
  }
}

export const ragSystem = new RAGSystem();
