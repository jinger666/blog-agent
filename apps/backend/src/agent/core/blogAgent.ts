import { AgentExecutor, createReactAgent } from 'langchain/agents';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { Tool } from '@langchain/core/tools';
import { ChatPromptTemplate, MessagesPlaceholder } from '@langchain/core/prompts';
import { SystemMessage, HumanMessage, AIMessage } from '@langchain/core/messages';
import { logger } from '../../utils/logger';
import { getDefaultLLM } from './llmProvider';
import { toolRegistry } from './toolRegistry';

export interface AgentConfig {
  llm?: BaseChatModel;
  tools?: Tool[];
  maxIterations?: number;
  verbose?: boolean;
}

export interface AgentResponse {
  response: string;
  usedTools: string[];
  intermediateSteps: Array<{
    action: string;
    actionInput: any;
    observation: string;
  }>;
  sessionId: string;
}

class BlogAgent {
  private llm: BaseChatModel;
  private tools: Tool[];
  private executor: AgentExecutor | null = null;
  private maxIterations: number;

  constructor(config: AgentConfig = {}) {
    this.llm = config.llm || getDefaultLLM();
    this.tools = config.tools || toolRegistry.getAllTools();
    this.maxIterations = config.maxIterations || 10;
  }

  async initialize(): Promise<void> {
    try {
      const prompt = ChatPromptTemplate.fromMessages([
        new SystemMessage(
          `You are an AI assistant specialized in blog content creation and optimization.
          
Your capabilities include:
- Generating catchy blog titles
- Creating content outlines
- Analyzing and summarizing text
- Optimizing content for SEO
- Formatting content for different platforms (especially CSDN)
- Processing multi-modal content (text, images, documents)

Always provide helpful, accurate, and well-structured responses.
When using tools, explain what you're doing and why.`
        ),
        new MessagesPlaceholder('chat_history'),
        new HumanMessage('{input}'),
        new MessagesPlaceholder('agent_scratchpad'),
      ]);

      this.executor = await createReactAgent({
        llm: this.llm,
        tools: this.tools,
        prompt,
      });

      logger.info('BlogAgent initialized successfully');
    } catch (error) {
      logger.error('Failed to initialize BlogAgent:', error);
      throw error;
    }
  }

  async chat(
    input: string,
    chatHistory: Array<{ role: string; content: string }> = [],
    sessionId: string = 'default'
  ): Promise<AgentResponse> {
    if (!this.executor) {
      await this.initialize();
    }

    try {
      logger.info(`Processing chat request for session ${sessionId}`);

      const result = await this.executor!.invoke({
        input,
        chat_history: chatHistory.map(msg => 
          msg.role === 'user' 
            ? new HumanMessage(msg.content)
            : new AIMessage(msg.content)
        ),
      });

      const usedTools = result.intermediateSteps?.map(step => step.action) || [];

      const response: AgentResponse = {
        response: result.output,
        usedTools,
        intermediateSteps: result.intermediateSteps?.map(step => ({
          action: step.action,
          actionInput: step.actionInput,
          observation: step.observation,
        })) || [],
        sessionId,
      };

      logger.info(`Chat response generated for session ${sessionId}`);
      return response;
    } catch (error: any) {
      logger.error(`Error in agent chat: ${error.message}`);
      throw error;
    }
  }

  async executeSkill(skillName: string, input: any): Promise<any> {
    const tool = this.tools.find(t => t.name === skillName);
    
    if (!tool) {
      throw new Error(`Skill not found: ${skillName}`);
    }

    try {
      logger.info(`Executing skill: ${skillName}`);
      const result = await tool.invoke(typeof input === 'string' ? input : JSON.stringify(input));
      return JSON.parse(result);
    } catch (error: any) {
      logger.error(`Error executing skill ${skillName}: ${error.message}`);
      throw error;
    }
  }

  getAvailableTools(): Array<{ name: string; description: string }> {
    return this.tools.map(tool => ({
      name: tool.name,
      description: tool.description,
    }));
  }
}

// Singleton instance
let agentInstance: BlogAgent | null = null;

export const getAgent = (): BlogAgent => {
  if (!agentInstance) {
    agentInstance = new BlogAgent();
  }
  return agentInstance;
};

export const resetAgent = (): void => {
  agentInstance = null;
};
