import { Injectable, Logger } from '@nestjs/common';
import { getAgent } from '../../agent/core/blogAgent';
import { shortTermMemory } from '../../agent/memory/shortTermMemory';
import { longTermMemory } from '../../agent/memory/longTermMemory';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class AgentService {
  private readonly logger = new Logger(AgentService.name);

  async chat(
    message: string,
    sessionId?: string,
    context?: any,
    userId: string = 'anonymous'
  ) {
    try {
      const agent = getAgent();
      const currentSessionId = sessionId || uuidv4();

      // Get chat history from short-term memory
      const chatHistory = await shortTermMemory.getMessages(currentSessionId, 10);

      // Process with agent
      const result = await agent.chat(message, chatHistory, currentSessionId);

      // Store messages in short-term memory
      await shortTermMemory.addMessage(currentSessionId, {
        role: 'user',
        content: message,
        timestamp: new Date(),
      });

      await shortTermMemory.addMessage(currentSessionId, {
        role: 'assistant',
        content: result.response,
        timestamp: new Date(),
      });

      // Store important information in long-term memory
      if (result.usedTools.length > 0 || message.length > 50) {
        await longTermMemory.storeMemory({
          id: uuidv4(),
          userId,
          content: `${message} -> ${result.response.substring(0, 200)}`,
          category: 'history',
          metadata: {
            sessionId: currentSessionId,
            usedTools: result.usedTools,
          },
        });
      }

      return {
        response: result.response,
        sessionId: currentSessionId,
        usedTools: result.usedTools,
        memoryUpdated: true,
      };
    } catch (error: any) {
      this.logger.error(`Error in agent chat: ${error.message}`);
      throw error;
    }
  }

  async executeSkill(skill: string, input: any, userId: string = 'anonymous') {
    try {
      const agent = getAgent();
      const result = await agent.executeSkill(skill, input);

      return {
        result,
        skill,
      };
    } catch (error: any) {
      this.logger.error(`Error executing skill ${skill}: ${error.message}`);
      throw error;
    }
  }

  async listSessions(userId: string = 'anonymous', limit: number = 10) {
    try {
      const sessions = await shortTermMemory.getUserSessions(userId, limit);
      return { sessions };
    } catch (error: any) {
      this.logger.error(`Error listing sessions: ${error.message}`);
      throw error;
    }
  }

  async getSessionHistory(sessionId: string, limit?: number) {
    try {
      const messages = await shortTermMemory.getMessages(
        sessionId,
        limit
      );

      return {
        sessionId,
        messages,
        count: messages.length,
      };
    } catch (error: any) {
      this.logger.error(`Error getting session history: ${error.message}`);
      throw error;
    }
  }
}
