import { Tool } from '@langchain/core/tools';
import { z } from 'zod';

export interface ToolRegistry {
  registerTool(tool: Tool): void;
  getTool(name: string): Tool | undefined;
  getAllTools(): Tool[];
  removeTool(name: string): void;
}

class InMemoryToolRegistry implements ToolRegistry {
  private tools: Map<string, Tool> = new Map();

  registerTool(tool: Tool): void {
    this.tools.set(tool.name, tool);
  }

  getTool(name: string): Tool | undefined {
    return this.tools.get(name);
  }

  getAllTools(): Tool[] {
    return Array.from(this.tools.values());
  }

  removeTool(name: string): void {
    this.tools.delete(name);
  }
}

export const toolRegistry = new InMemoryToolRegistry();

// Example base tool implementation
export class BaseTool extends Tool {
  constructor(
    public name: string,
    public description: string
  ) {
    super();
  }

  async _call(input: string): Promise<string> {
    try {
      const result = await this.execute(input);
      return JSON.stringify(result);
    } catch (error: any) {
      return JSON.stringify({ error: error.message });
    }
  }

  async execute(input: any): Promise<any> {
    throw new Error('Method not implemented');
  }
}

// Text Analyzer Tool
export class TextAnalyzerTool extends BaseTool {
  constructor() {
    super(
      'text_analyzer',
      'Analyze text structure, extract keywords, and determine sentiment'
    );
  }

  async execute(text: string): Promise<any> {
    const words = text.split(/\s+/).length;
    const sentences = text.split(/[.!?]+/).filter(s => s.trim()).length;
    
    // Simple keyword extraction (top 5 most frequent words)
    const wordFreq: Record<string, number> = {};
    text.toLowerCase().split(/\W+/).forEach(word => {
      if (word.length > 3) {
        wordFreq[word] = (wordFreq[word] || 0) + 1;
      }
    });
    
    const keywords = Object.entries(wordFreq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);

    return {
      wordCount: words,
      sentenceCount: sentences,
      keywords,
      avgWordsPerSentence: Math.round(words / sentences),
    };
  }
}

// Text Summarizer Tool
export class TextSummarizerTool extends BaseTool {
  constructor() {
    super(
      'text_summarizer',
      'Generate a concise summary of the provided text'
    );
  }

  async execute(text: string): Promise<any> {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim());
    const summaryLength = Math.min(3, sentences.length);
    const summary = sentences.slice(0, summaryLength).join('. ') + '.';
    
    return {
      originalLength: text.length,
      summaryLength: summary.length,
      summary,
      compressionRatio: Math.round((1 - summary.length / text.length) * 100),
    };
  }
}

// Initialize default tools
export const initializeDefaultTools = (): void => {
  toolRegistry.registerTool(new TextAnalyzerTool());
  toolRegistry.registerTool(new TextSummarizerTool());
};
