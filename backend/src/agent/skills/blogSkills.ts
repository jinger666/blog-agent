import { BaseTool } from '../core/toolRegistry';
import { getDefaultLLM } from '../core/llmProvider';
import { HumanMessage, SystemMessage } from '@langchain/core/messages';
import { logger } from '../../utils/logger';

// Title Generator Skill
export class TitleGeneratorSkill extends BaseTool {
  constructor() {
    super(
      'title_generator',
      'Generate catchy and SEO-friendly blog titles based on topic or content'
    );
  }

  async execute(input: string | { topic: string; style?: string; count?: number }): Promise<any> {
    try {
      const topic = typeof input === 'string' ? input : input.topic;
      const style = typeof input === 'string' ? 'professional' : input.style || 'professional';
      const count = typeof input === 'string' ? 5 : input.count || 5;

      const llm = getDefaultLLM();
      
      const prompt = new SystemMessage(`You are an expert blog title generator.
Generate ${count} catchy, SEO-friendly titles for a blog post about: "${topic}"

Style: ${style}

Guidelines:
- Make titles engaging and clickable
- Include relevant keywords
- Keep titles under 60 characters when possible
- Use power words and emotional triggers
- Vary the title structures (how-to, list, question, etc.)

Return ONLY a JSON array of title strings, nothing else.`);

      const response = await llm.invoke([prompt]);
      
      // Parse the response to extract titles
      const content = response.content.toString();
      let titles: string[] = [];
      
      try {
        // Try to parse as JSON
        const jsonMatch = content.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          titles = JSON.parse(jsonMatch[0]);
        }
      } catch {
        // Fallback: split by newlines and clean up
        titles = content
          .split('\n')
          .map(line => line.replace(/^[\d\-\*•]+\s*/, '').trim())
          .filter(line => line.length > 10 && line.length < 100)
          .slice(0, count);
      }

      return {
        topic,
        style,
        titles,
        count: titles.length,
      };
    } catch (error: any) {
      logger.error('Error generating titles:', error);
      throw error;
    }
  }
}

// Content Outliner Skill
export class ContentOutlinerSkill extends BaseTool {
  constructor() {
    super(
      'content_outliner',
      'Create structured content outlines with sections and subsections for blog posts'
    );
  }

  async execute(input: string | { topic: string; sections?: number }): Promise<any> {
    try {
      const topic = typeof input === 'string' ? input : input.topic;
      const sections = typeof input === 'string' ? 5 : input.sections || 5;

      const llm = getDefaultLLM();
      
      const prompt = new SystemMessage(`You are an expert content strategist.
Create a detailed outline for a blog post about: "${topic}"

Structure:
- Introduction
- ${sections} main sections with 2-3 subsections each
- Conclusion

Format as a hierarchical markdown outline with clear headings.
Make it comprehensive and actionable.`);

      const response = await llm.invoke([prompt]);
      const outline = response.content.toString();

      return {
        topic,
        outline,
        estimatedSections: sections,
        format: 'markdown',
      };
    } catch (error: any) {
      logger.error('Error creating outline:', error);
      throw error;
    }
  }
}

// Mind Map Generator Skill
export class MindMapGeneratorSkill extends BaseTool {
  constructor() {
    super(
      'mindmap_generator',
      'Generate mind map structure from content or topic in JSON format'
    );
  }

  async execute(input: string | { topic: string; depth?: number }): Promise<any> {
    try {
      const topic = typeof input === 'string' ? input : input.topic;
      const depth = typeof input === 'string' ? 3 : input.depth || 3;

      const llm = getDefaultLLM();
      
      const prompt = new SystemMessage(`You are an expert at creating mind maps.
Create a mind map structure for: "${topic}"

Depth levels: ${depth}

Return ONLY a JSON object in this format:
{
  "centralTopic": "string",
  "branches": [
    {
      "name": "string",
      "subtopics": ["string"]
    }
  ]
}

Make it comprehensive but concise.`);

      const response = await llm.invoke([prompt]);
      const content = response.content.toString();
      
      let mindMap: any = {};
      try {
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          mindMap = JSON.parse(jsonMatch[0]);
        }
      } catch {
        mindMap = {
          centralTopic: topic,
          branches: [],
          note: 'Failed to parse mind map - requires manual creation',
        };
      }

      return {
        topic,
        mindMap,
        format: 'json',
      };
    } catch (error: any) {
      logger.error('Error generating mind map:', error);
      throw error;
    }
  }
}

// SEO Optimizer Skill
export class SEOOptimizerSkill extends BaseTool {
  constructor() {
    super(
      'seo_optimizer',
      'Analyze content and provide SEO optimization suggestions'
    );
  }

  async execute(content: string): Promise<any> {
    try {
      const llm = getDefaultLLM();
      
      const prompt = new SystemMessage(`You are an SEO expert.
Analyze the following content and provide optimization suggestions:

Content: "${content.substring(0, 2000)}"

Provide:
1. SEO Score (1-10)
2. Keyword suggestions
3. Meta description recommendation
4. Title tag optimization
5. Content structure improvements
6. Internal linking opportunities

Format as JSON with these fields:
{
  "seoScore": number,
  "keywords": string[],
  "metaDescription": string,
  "titleSuggestion": string,
  "improvements": string[]
}`);

      const response = await llm.invoke([prompt]);
      const content_str = response.content.toString();
      
      let seoAnalysis: any = {};
      try {
        const jsonMatch = content_str.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          seoAnalysis = JSON.parse(jsonMatch[0]);
        }
      } catch {
        seoAnalysis = {
          seoScore: 5,
          keywords: [],
          metaDescription: '',
          titleSuggestion: '',
          improvements: ['Content analysis requires proper parsing'],
        };
      }

      return {
        originalLength: content.length,
        analysis: seoAnalysis,
      };
    } catch (error: any) {
      logger.error('Error analyzing SEO:', error);
      throw error;
    }
  }
}

// CSDN Formatter Skill
export class CSDNFormatterSkill extends BaseTool {
  constructor() {
    super(
      'csdn_formatter',
      'Format content specifically for CSDN platform with proper markdown and code blocks'
    );
  }

  async execute(content: string): Promise<any> {
    try {
      // CSDN-specific formatting rules
      let formatted = content;
      
      // Ensure proper code block syntax
      formatted = formatted.replace(/```(\w*)/g, '```$1');
      
      // Add CSDN-specific frontmatter if not present
      if (!formatted.startsWith('---')) {
        formatted = `---
title: Blog Post
tags: [technology]
categories: [Development]
---

${formatted}`;
      }

      return {
        originalLength: content.length,
        formattedLength: formatted.length,
        csdnFormatted: formatted,
        platform: 'CSDN',
      };
    } catch (error: any) {
      logger.error('Error formatting for CSDN:', error);
      throw error;
    }
  }
}

// Initialize all skills
export const initializeSkills = (): void => {
  const { toolRegistry } = require('../core/toolRegistry');
  toolRegistry.registerTool(new TitleGeneratorSkill());
  toolRegistry.registerTool(new ContentOutlinerSkill());
  toolRegistry.registerTool(new MindMapGeneratorSkill());
  toolRegistry.registerTool(new SEOOptimizerSkill());
  toolRegistry.registerTool(new CSDNFormatterSkill());
};
