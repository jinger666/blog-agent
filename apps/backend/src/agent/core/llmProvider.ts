import { ChatOpenAI } from '@langchain/openai';
import { ChatAnthropic } from '@langchain/anthropic';
import { BaseChatModel } from '@langchain/core/language_models/chat_models';
import { logger } from '../../utils/logger';

export type LLMProvider = 'openai' | 'anthropic' | 'ollama' | 'deepseek';

export interface LLMConfig {
  provider: LLMProvider;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
}

class LLMProviderFactory {
  private static instance: LLMProviderFactory;
  private llmCache: Map<string, BaseChatModel> = new Map();

  private constructor() {}

  static getInstance(): LLMProviderFactory {
    if (!LLMProviderFactory.instance) {
      LLMProviderFactory.instance = new LLMProviderFactory();
    }
    return LLMProviderFactory.instance;
  }

  createLLM(config: LLMConfig): BaseChatModel {
    const cacheKey = `${config.provider}-${config.model}`;
    
    if (this.llmCache.has(cacheKey)) {
      return this.llmCache.get(cacheKey)!;
    }

    let llm: BaseChatModel;

    switch (config.provider) {
      case 'openai':
        llm = new ChatOpenAI({
          modelName: config.model || 'gpt-4',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          openAIApiKey: config.apiKey || process.env.OPENAI_API_KEY,
          streaming: true,
        });
        break;

      case 'deepseek':
        llm = new ChatOpenAI({
          modelName: config.model || 'deepseek-chat',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          openAIApiKey: config.apiKey || process.env.DEEPSEEK_API_KEY,
          streaming: true,
          configuration: {
            baseURL: process.env.DEEPSEEK_BASE_URL || 'https://api.deepseek.com/v1',
          },
        });
        break;

      case 'anthropic':
        llm = new ChatAnthropic({
          modelName: config.model || 'claude-3-sonnet-20240229',
          temperature: config.temperature || 0.7,
          maxTokens: config.maxTokens || 2000,
          anthropicApiKey: config.apiKey || process.env.ANTHROPIC_API_KEY,
        });
        break;

      default:
        throw new Error(`Unsupported LLM provider: ${config.provider}`);
    }

    this.llmCache.set(cacheKey, llm);
    logger.info(`LLM initialized: ${config.provider}/${config.model}`);
    
    return llm;
  }

  clearCache(): void {
    this.llmCache.clear();
  }
}

export const llmFactory = LLMProviderFactory.getInstance();

export const getDefaultLLM = (): BaseChatModel => {
  return llmFactory.createLLM({
    provider: (process.env.LLM_PROVIDER as LLMProvider) || 'deepseek',
    model: process.env.LLM_MODEL || 'deepseek-chat',
    temperature: parseFloat(process.env.LLM_TEMPERATURE || '0.7'),
    maxTokens: parseInt(process.env.LLM_MAX_TOKENS || '2000'),
  });
};
