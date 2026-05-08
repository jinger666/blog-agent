import { Injectable, Logger } from '@nestjs/common';
import { ragSystem } from '../../agent/rag/ragSystem';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class RagService {
  private readonly logger = new Logger(RagService.name);

  async indexDocument(content: string, metadata?: any, type?: string) {
    try {
      const documentId = uuidv4();
      const chunkCount = await ragSystem.indexDocument({
        id: documentId,
        content,
        metadata,
        type: type as 'pdf' | 'docx' | 'txt' | 'markdown',
      });

      return {
        message: 'Document indexed successfully',
        documentId,
        chunkCount,
      };
    } catch (error: any) {
      this.logger.error(`Error indexing document: ${error.message}`);
      throw error;
    }
  }

  async query(queryText: string, topK = 5) {
    try {
      const result = await ragSystem.query(queryText, { topK });
      return result;
    } catch (error: any) {
      this.logger.error(`Error querying RAG: ${error.message}`);
      throw error;
    }
  }

  async removeDocument(documentId: string) {
    try {
      const deletedCount = await ragSystem.removeDocument(documentId);

      return {
        message: 'Document removed successfully',
        deletedCount,
      };
    } catch (error: any) {
      this.logger.error(`Error removing document: ${error.message}`);
      throw error;
    }
  }

  async getStats() {
    try {
      const stats = await ragSystem.getStats();
      return stats;
    } catch (error: any) {
      this.logger.error(`Error getting RAG stats: ${error.message}`);
      throw error;
    }
  }
}
