import Memory from '../../models/Memory';
import { logger } from '../../utils/logger';

export interface MemoryData {
  id: string;
  userId: string;
  content: string;
  category: 'fact' | 'preference' | 'history';
  importance?: number;
  metadata?: Record<string, any>;
}

export interface SearchResult {
  memory: any;
  similarity: number;
}

class LongTermMemoryManager {
  private importanceThreshold: number;

  constructor() {
    this.importanceThreshold = parseFloat(process.env.MEMORY_LONG_TERM_IMPORTANCE_THRESHOLD || '0.5');
  }

  async storeMemory(data: MemoryData): Promise<any> {
    try {
      // Generate embedding (simplified - in production use OpenAI embeddings)
      const embedding = await this.generateEmbedding(data.content);

      const memory = await Memory.create({
        id: data.id,
        userId: data.userId,
        content: data.content,
        embedding,
        category: data.category,
        importance: data.importance || this.calculateImportance(data.content),
        accessedAt: new Date(),
        metadata: data.metadata || {},
      });

      logger.info(`Stored long-term memory: ${data.id}`);
      return memory;
    } catch (error) {
      logger.error(`Error storing memory:`, error);
      throw error;
    }
  }

  async searchMemories(
    userId: string,
    query: string,
    options: {
      limit?: number;
      category?: string;
      minImportance?: number;
    } = {}
  ): Promise<SearchResult[]> {
    try {
      const {
        limit = 10,
        category,
        minImportance = this.importanceThreshold,
      } = options;

      // Build query filter
      const filter: any = {
        userId,
        importance: { $gte: minImportance },
      };

      if (category) {
        filter.category = category;
      }

      // For now, use simple text search (in production, use vector similarity)
      const memories = await Memory.find(filter)
        .sort({ importance: -1, accessedAt: -1 })
        .limit(limit * 2) // Get more results for ranking
        .lean();

      // Rank by relevance (simplified - in production use cosine similarity)
      const queryTerms = query.toLowerCase().split(/\s+/);
      const ranked = memories
        .map(memory => {
          const content = memory.content.toLowerCase();
          const matchCount = queryTerms.filter(term => content.includes(term)).length;
          const similarity = matchCount / queryTerms.length;
          
          return {
            memory,
            similarity,
          };
        })
        .filter(result => result.similarity > 0)
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, limit);

      // Update accessedAt timestamps
      await Promise.all(
        ranked.map(result =>
          Memory.findByIdAndUpdate(result.memory._id, {
            accessedAt: new Date(),
          })
        )
      );

      logger.info(`Found ${ranked.length} memories for user ${userId}`);
      return ranked;
    } catch (error) {
      logger.error(`Error searching memories:`, error);
      return [];
    }
  }

  async updateMemory(id: string, updates: Partial<MemoryData>): Promise<any> {
    try {
      const memory = await Memory.findOneAndUpdate(
        { id },
        {
          ...updates,
          updatedAt: new Date(),
        },
        { new: true }
      );

      if (!memory) {
        throw new Error(`Memory not found: ${id}`);
      }

      logger.info(`Updated memory: ${id}`);
      return memory;
    } catch (error) {
      logger.error(`Error updating memory ${id}:`, error);
      throw error;
    }
  }

  async deleteMemory(id: string): Promise<void> {
    try {
      const result = await Memory.findOneAndDelete({ id });
      
      if (!result) {
        throw new Error(`Memory not found: ${id}`);
      }

      logger.info(`Deleted memory: ${id}`);
    } catch (error) {
      logger.error(`Error deleting memory ${id}:`, error);
      throw error;
    }
  }

  async getMemoryStats(userId: string): Promise<any> {
    try {
      const stats = await Memory.aggregate([
        { $match: { userId } },
        {
          $group: {
            _id: '$category',
            count: { $sum: 1 },
            avgImportance: { $avg: '$importance' },
          },
        },
      ]);

      const total = await Memory.countDocuments({ userId });
      const byCategory: Record<string, number> = {};
      
      stats.forEach((stat: any) => {
        byCategory[stat._id] = stat.count;
      });

      return {
        total,
        byCategory: {
          fact: byCategory.fact || 0,
          preference: byCategory.preference || 0,
          history: byCategory.history || 0,
        },
      };
    } catch (error) {
      logger.error(`Error getting memory stats:`, error);
      return {
        total: 0,
        byCategory: { fact: 0, preference: 0, history: 0 },
      };
    }
  }

  async cleanupOldMemories(olderThanDays: number): Promise<number> {
    try {
      const cutoffDate = new Date();
      cutoffDate.setDate(cutoffDate.getDate() - olderThanDays);

      const result = await Memory.deleteMany({
        importance: { $lt: this.importanceThreshold },
        accessedAt: { $lt: cutoffDate },
      });

      logger.info(`Cleaned up ${result.deletedCount} old memories`);
      return result.deletedCount;
    } catch (error) {
      logger.error(`Error cleaning up memories:`, error);
      return 0;
    }
  }

  private async generateEmbedding(text: string): Promise<number[]> {
    // TODO: Implement actual embedding generation with OpenAI API
    // For now, return a placeholder vector
    // In production, use: const response = await openai.embeddings.create({...})
    
    // Simple hash-based placeholder (NOT for production use)
    const vector = new Array(1536).fill(0);
    for (let i = 0; i < text.length && i < 100; i++) {
      vector[i % 1536] += text.charCodeAt(i) / 1000;
    }
    
    return vector;
  }

  private calculateImportance(content: string): number {
    // Simple heuristic for importance calculation
    const length = content.length;
    const hasKeywords = /(important|critical|remember|always|never)/i.test(content);
    const isQuestion = /\?$/.test(content.trim());
    
    let importance = 0.5;
    
    if (length > 100) importance += 0.1;
    if (length > 500) importance += 0.1;
    if (hasKeywords) importance += 0.2;
    if (!isQuestion) importance += 0.1;
    
    return Math.min(importance, 1.0);
  }
}

export const longTermMemory = new LongTermMemoryManager();
