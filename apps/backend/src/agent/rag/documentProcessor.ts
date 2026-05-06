import { RecursiveCharacterTextSplitter } from 'langchain/text_splitter';
import { logger } from '../../utils/logger';

export interface DocumentChunk {
  id: string;
  content: string;
  metadata: Record<string, any>;
  embedding?: number[];
}

export interface DocumentData {
  id: string;
  content: string;
  metadata?: Record<string, any>;
  type?: 'pdf' | 'docx' | 'txt' | 'markdown';
}

class DocumentProcessor {
  private chunkSize: number;
  private chunkOverlap: number;
  private splitter: RecursiveCharacterTextSplitter;

  constructor() {
    this.chunkSize = parseInt(process.env.RAG_CHUNK_SIZE || '1000');
    this.chunkOverlap = parseInt(process.env.RAG_CHUNK_OVERLAP || '200');
    
    this.splitter = new RecursiveCharacterTextSplitter({
      chunkSize: this.chunkSize,
      chunkOverlap: this.chunkOverlap,
    });
  }

  async processDocument(doc: DocumentData): Promise<DocumentChunk[]> {
    try {
      logger.info(`Processing document: ${doc.id}`);

      // Split document into chunks
      const texts = await this.splitter.splitText(doc.content);
      
      logger.info(`Document split into ${texts.length} chunks`);

      // Create chunks with metadata
      const chunks: DocumentChunk[] = texts.map((text, index) => ({
        id: `${doc.id}-chunk-${index}`,
        content: text,
        metadata: {
          documentId: doc.id,
          chunkIndex: index,
          totalChunks: texts.length,
          type: doc.type || 'txt',
          ...doc.metadata,
        },
      }));

      return chunks;
    } catch (error) {
      logger.error(`Error processing document ${doc.id}:`, error);
      throw error;
    }
  }

  async generateEmbeddings(chunks: DocumentChunk[]): Promise<DocumentChunk[]> {
    try {
      logger.info(`Generating embeddings for ${chunks.length} chunks`);

      // TODO: Implement actual embedding generation with OpenAI API
      // For now, use placeholder embeddings
      const chunksWithEmbeddings = chunks.map(chunk => ({
        ...chunk,
        embedding: this.generatePlaceholderEmbedding(chunk.content),
      }));

      logger.info('Embeddings generated successfully');
      return chunksWithEmbeddings;
    } catch (error) {
      logger.error('Error generating embeddings:', error);
      throw error;
    }
  }

  private generatePlaceholderEmbedding(text: string): number[] {
    // Simple hash-based placeholder (NOT for production use)
    // In production, use OpenAI embeddings API
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 100; i++) {
      vector[i % 1536] += text.charCodeAt(i) / 1000;
    }
    return vector;
  }
}

export const documentProcessor = new DocumentProcessor();
