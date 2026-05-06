import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Memory, MemoryDocument } from './schemas/memory.schema';
import { Session, SessionDocument } from './schemas/session.schema';
import { longTermMemory } from '../../agent/memory/longTermMemory';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class MemoryService {
  private readonly logger = new Logger(MemoryService.name);

  constructor(
    @InjectModel(Memory.name) private memoryModel: Model<MemoryDocument>,
    @InjectModel(Session.name) private sessionModel: Model<SessionDocument>,
  ) {}

  async searchMemories(userId: string, query: string, limit = 10, category?: string) {
    try {
      const results = await longTermMemory.searchMemories(userId, query, {
        limit,
        category,
      });

      return {
        memories: results.map(r => ({
          id: r.memory.id,
          content: r.memory.content,
          category: r.memory.category,
          importance: r.memory.importance,
          similarity: r.similarity,
          createdAt: r.memory.createdAt,
        })),
        count: results.length,
      };
    } catch (error: any) {
      this.logger.error(`Error searching memories: ${error.message}`);
      throw error;
    }
  }

  async storeMemory(content: string, category: string, userId: string = 'anonymous', metadata?: any) {
    try {
      if (!['fact', 'preference', 'history'].includes(category)) {
        throw new Error('Invalid category. Must be: fact, preference, or history');
      }

      const memory = await longTermMemory.storeMemory({
        id: uuidv4(),
        userId,
        content,
        category: category as 'fact' | 'preference' | 'history',
        metadata,
      });

      return {
        memory: {
          id: memory.id,
          content: memory.content,
          category: memory.category,
          importance: memory.importance,
        },
        message: 'Memory stored successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error storing memory: ${error.message}`);
      throw error;
    }
  }

  async updateMemory(id: string, updates: any) {
    try {
      const memory = await longTermMemory.updateMemory(id, updates);

      return {
        memory: {
          id: memory.id,
          content: memory.content,
          category: memory.category,
          importance: memory.importance,
        },
        message: 'Memory updated successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error updating memory: ${error.message}`);
      throw error;
    }
  }

  async deleteMemory(id: string) {
    try {
      await longTermMemory.deleteMemory(id);

      return {
        message: 'Memory deleted successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error deleting memory: ${error.message}`);
      throw error;
    }
  }

  async getMemoryStats(userId: string = 'anonymous') {
    try {
      const stats = await longTermMemory.getMemoryStats(userId);
      return stats;
    } catch (error: any) {
      this.logger.error(`Error getting memory stats: ${error.message}`);
      throw error;
    }
  }
}
