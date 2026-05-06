import Session from '../../models/Session';
import { logger } from '../../utils/logger';

export interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

export interface ShortTermMemoryConfig {
  windowSize?: number;
  summarizeThreshold?: number;
}

class ShortTermMemoryManager {
  private windowSize: number;
  private summarizeThreshold: number;

  constructor(config: ShortTermMemoryConfig = {}) {
    this.windowSize = config.windowSize || parseInt(process.env.MEMORY_SHORT_TERM_WINDOW || '10');
    this.summarizeThreshold = config.summarizeThreshold || parseInt(process.env.MEMORY_AUTO_SUMMARIZE_THRESHOLD || '20');
  }

  async getOrCreateSession(sessionId: string, userId: string): Promise<any> {
    try {
      let session = await Session.findOne({ id: sessionId });

      if (!session) {
        session = await Session.create({
          id: sessionId,
          userId,
          messages: [],
          context: {},
        });
        logger.info(`Created new session: ${sessionId}`);
      }

      return session;
    } catch (error) {
      logger.error(`Error getting session ${sessionId}:`, error);
      throw error;
    }
  }

  async addMessage(sessionId: string, message: Message): Promise<void> {
    try {
      const session = await Session.findOne({ id: sessionId });
      
      if (!session) {
        throw new Error(`Session not found: ${sessionId}`);
      }

      session.messages.push(message);
      session.lastActiveAt = new Date();

      // Apply sliding window if needed
      if (session.messages.length > this.summarizeThreshold) {
        await this.summarizeAndPrune(session);
      } else if (session.messages.length > this.windowSize) {
        this.applySlidingWindow(session);
      }

      await session.save();
    } catch (error) {
      logger.error(`Error adding message to session ${sessionId}:`, error);
      throw error;
    }
  }

  async getMessages(sessionId: string, limit?: number): Promise<Message[]> {
    try {
      const session = await Session.findOne({ id: sessionId });
      
      if (!session) {
        return [];
      }

      const messages = session.messages || [];
      const result = limit ? messages.slice(-limit) : messages;
      
      return result.map(msg => ({
        role: msg.role,
        content: msg.content,
        timestamp: msg.timestamp,
      }));
    } catch (error) {
      logger.error(`Error getting messages for session ${sessionId}:`, error);
      return [];
    }
  }

  private applySlidingWindow(session: any): void {
    if (session.messages.length > this.windowSize) {
      session.messages = session.messages.slice(-this.windowSize);
      logger.debug(`Applied sliding window to session, keeping last ${this.windowSize} messages`);
    }
  }

  private async summarizeAndPrune(session: any): Promise<void> {
    // TODO: Implement automatic summarization
    // For now, just keep the most recent messages
    const messagesToKeep = Math.floor(this.windowSize / 2);
    session.messages = session.messages.slice(-messagesToKeep);
    
    logger.info(`Summarized and pruned session ${session.id}, kept ${messagesToKeep} messages`);
  }

  async clearSession(sessionId: string): Promise<void> {
    try {
      await Session.findOneAndUpdate(
        { id: sessionId },
        { messages: [], lastActiveAt: new Date() }
      );
      logger.info(`Cleared session: ${sessionId}`);
    } catch (error) {
      logger.error(`Error clearing session ${sessionId}:`, error);
      throw error;
    }
  }

  async deleteSession(sessionId: string): Promise<void> {
    try {
      await Session.findOneAndDelete({ id: sessionId });
      logger.info(`Deleted session: ${sessionId}`);
    } catch (error) {
      logger.error(`Error deleting session ${sessionId}:`, error);
      throw error;
    }
  }

  async getUserSessions(userId: string, limit: number = 10): Promise<any[]> {
    try {
      const sessions = await Session.find({ userId })
        .sort({ lastActiveAt: -1 })
        .limit(limit)
        .select('id createdAt lastActiveAt');
      
      return sessions;
    } catch (error) {
      logger.error(`Error getting sessions for user ${userId}:`, error);
      return [];
    }
  }
}

export const shortTermMemory = new ShortTermMemoryManager();
