import { BaseTool } from '../agent/core/toolRegistry';
import * as fs from 'fs/promises';
import * as path from 'path';
import { logger } from '../utils/logger';

// Markdown Formatter Tool
export class MarkdownFormatterTool extends BaseTool {
  constructor() {
    super(
      'markdown_formatter',
      'Format text content as properly structured Markdown with headings, lists, and code blocks'
    );
  }

  async execute(input: string | { content: string; style?: string }): Promise<any> {
    const content = typeof input === 'string' ? input : input.content;
    
    // Convert plain text to markdown
    const lines = content.split('\n');
    const markdownLines: string[] = [];
    
    let inCodeBlock = false;
    let inList = false;
    
    for (const line of lines) {
      const trimmed = line.trim();
      
      if (!trimmed) {
        markdownLines.push('');
        continue;
      }
      
      // Detect code blocks
      if (trimmed.startsWith('```') || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
        if (!inCodeBlock) {
          markdownLines.push('```');
          inCodeBlock = true;
        } else {
          markdownLines.push('```');
          inCodeBlock = false;
        }
        markdownLines.push(trimmed);
        continue;
      }
      
      if (inCodeBlock) {
        markdownLines.push(`  ${trimmed}`);
        continue;
      }
      
      // Detect headings (lines ending with colon or all caps short lines)
      if (trimmed.endsWith(':') && trimmed.length < 50) {
        markdownLines.push(`\n## ${trimmed.slice(0, -1)}\n`);
        continue;
      }
      
      // Detect list items
      if (trimmed.startsWith('-') || trimmed.startsWith('*') || /^\d+\./.test(trimmed)) {
        if (!inList) {
          markdownLines.push('');
          inList = true;
        }
        markdownLines.push(trimmed);
        continue;
      }
      
      inList = false;
      markdownLines.push(trimmed);
    }
    
    const formatted = markdownLines.join('\n');
    
    return {
      originalLength: content.length,
      formattedLength: formatted.length,
      markdown: formatted,
    };
  }
}

// Text Translator Tool
export class TextTranslatorTool extends BaseTool {
  constructor() {
    super(
      'text_translator',
      'Translate text between languages (supports: en, zh, ja, ko, es, fr, de)'
    );
  }

  async execute(input: string | { text: string; targetLang: string }): Promise<any> {
    const text = typeof input === 'string' ? input : input.text;
    const targetLang = typeof input === 'string' ? 'en' : input.targetLang || 'en';
    
    // TODO: Implement actual translation with LLM or translation API
    // For now, return placeholder
    logger.warn('Translation not fully implemented - returning original text');
    
    return {
      originalText: text,
      translatedText: text,
      sourceLang: 'auto-detected',
      targetLang,
      note: 'Translation requires LLM integration or external API',
    };
  }
}

// File Reader Tool
export class FileReaderTool extends BaseTool {
  constructor() {
    super(
      'file_reader',
      'Read content from text files (supports: .txt, .md, .json, .csv)'
    );
  }

  async execute(filePath: string): Promise<any> {
    try {
      // Security: Only allow reading from uploads directory
      const uploadDir = process.env.UPLOAD_DIR || './uploads';
      const safePath = path.resolve(uploadDir, path.basename(filePath));
      
      if (!safePath.startsWith(path.resolve(uploadDir))) {
        throw new Error('Invalid file path - access denied');
      }
      
      const content = await fs.readFile(safePath, 'utf-8');
      const stats = await fs.stat(safePath);
      
      return {
        filePath: safePath,
        fileName: path.basename(filePath),
        fileSize: stats.size,
        contentType: this.detectContentType(filePath),
        content: content.substring(0, 10000), // Limit to first 10KB
        truncated: content.length > 10000,
      };
    } catch (error: any) {
      logger.error(`Error reading file ${filePath}:`, error);
      throw error;
    }
  }

  private detectContentType(filePath: string): string {
    const ext = path.extname(filePath).toLowerCase();
    const types: Record<string, string> = {
      '.txt': 'text/plain',
      '.md': 'text/markdown',
      '.json': 'application/json',
      '.csv': 'text/csv',
    };
    return types[ext] || 'text/plain';
  }
}

// Initialize additional tools
export const initializeAdditionalTools = (): void => {
  const { toolRegistry } = require('../agent/core/toolRegistry');
  toolRegistry.registerTool(new MarkdownFormatterTool());
  toolRegistry.registerTool(new TextTranslatorTool());
  toolRegistry.registerTool(new FileReaderTool());
};
