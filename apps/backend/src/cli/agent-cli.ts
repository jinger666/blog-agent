#!/usr/bin/env node

import { Command } from 'commander';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

const program = new Command();
const API_URL = process.env.API_URL || 'http://localhost:3000/api';

// Helper function to make API requests
const apiRequest = async (method: string, endpoint: string, data?: any) => {
  try {
    const url = `${API_URL}${endpoint}`;
    const response = await axios({ method, url, data });
    return response.data;
  } catch (error: any) {
    console.error('Error:', error.response?.data?.error?.message || error.message);
    process.exit(1);
  }
};

program
  .name('agent-cli')
  .description('AI Blog Platform - Agent Management CLI')
  .version('1.0.0');

// Agent management commands
program
  .command('status')
  .description('Check agent service status')
  .action(async () => {
    try {
      const response = await axios.get(`${API_URL.replace('/api', '')}/health`);
      console.log('✅ Agent service is running');
      console.log(JSON.stringify(response.data, null, 2));
    } catch (error: any) {
      console.log('❌ Agent service is not responding');
      console.error(error.message);
    }
  });

program
  .command('logs')
  .description('View agent logs')
  .option('--tail <number>', 'Number of lines to show', '100')
  .action(async (options) => {
    console.log(`Showing last ${options.tail} log entries...`);
    console.log('Note: In production, this would read from log files or logging service');
  });

// Memory management commands
const memoryCmd = program.command('memory').description('Memory management commands');

memoryCmd
  .command('stats')
  .description('Show memory statistics')
  .option('--user <userId>', 'User ID', 'anonymous')
  .action(async (options) => {
    const stats = await apiRequest('get', `/memory/stats?userId=${options.user}`);
    console.log('\n📊 Memory Statistics:');
    console.log(`Total memories: ${stats.total}`);
    console.log('\nBy category:');
    console.log(`  Facts: ${stats.byCategory.fact}`);
    console.log(`  Preferences: ${stats.byCategory.preference}`);
    console.log(`  History: ${stats.byCategory.history}\n`);
  });

memoryCmd
  .command('search')
  .description('Search memories')
  .argument('<query>', 'Search query')
  .option('--limit <number>', 'Maximum results', '10')
  .option('--user <userId>', 'User ID', 'anonymous')
  .action(async (query, options) => {
    const result = await apiRequest(
      'get',
      `/memory/search?q=${encodeURIComponent(query)}&limit=${options.limit}&userId=${options.user}`
    );
    
    console.log(`\n🔍 Found ${result.count} memories:\n`);
    result.memories.forEach((mem: any, index: number) => {
      console.log(`${index + 1}. [${mem.category}] (similarity: ${(mem.similarity * 100).toFixed(1)}%)`);
      console.log(`   ${mem.content.substring(0, 100)}${mem.content.length > 100 ? '...' : ''}`);
      console.log(`   Importance: ${(mem.importance * 100).toFixed(0)}%\n`);
    });
  });

memoryCmd
  .command('cleanup')
  .description('Clean up old memories')
  .option('--older-than <days>', 'Remove memories older than N days', '30')
  .action(async (options) => {
    console.log(`Cleaning up memories older than ${options.olderThan} days...`);
    console.log('Note: This feature requires implementation in the backend');
  });

// Configuration commands
const configCmd = program.command('config').description('Configuration management');

configCmd
  .command('show')
  .description('Show current configuration')
  .action(async () => {
    console.log('\n⚙️  Current Configuration:\n');
    console.log(`API URL: ${API_URL}`);
    console.log(`Node Env: ${process.env.NODE_ENV || 'development'}`);
    console.log(`LLM Provider: ${process.env.LLM_PROVIDER || 'openai'}`);
    console.log(`LLM Model: ${process.env.LLM_MODEL || 'gpt-4'}`);
    console.log(`MongoDB: ${process.env.MONGODB_URI ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`Redis: ${process.env.REDIS_URL ? '✓ Configured' : '✗ Not configured'}`);
    console.log(`OpenAI API Key: ${process.env.OPENAI_API_KEY ? '✓ Set' : '✗ Not set'}\n`);
  });

configCmd
  .command('set')
  .description('Set configuration value')
  .argument('<key=value>', 'Configuration key and value')
  .action(async (arg) => {
    const [key, value] = arg.split('=');
    if (!key || !value) {
      console.error('Usage: agent-cli config set KEY=VALUE');
      process.exit(1);
    }

    const envPath = path.join(process.cwd(), '.env');
    let envContent = '';
    
    try {
      envContent = await fs.readFile(envPath, 'utf-8');
    } catch {
      console.log('Creating new .env file');
    }

    const lines = envContent.split('\n');
    const updatedLines = lines.map(line => {
      if (line.startsWith(`${key}=`)) {
        return `${key}=${value}`;
      }
      return line;
    });

    if (!updatedLines.some(line => line.startsWith(`${key}=`))) {
      updatedLines.push(`${key}=${value}`);
    }

    await fs.writeFile(envPath, updatedLines.join('\n'));
    console.log(`✓ Set ${key}=${value}`);
  });

// RAG commands
const ragCmd = program.command('rag').description('RAG system commands');

ragCmd
  .command('stats')
  .description('Show RAG index statistics')
  .action(async () => {
    const stats = await apiRequest('get', '/rag/stats');
    console.log('\n📚 RAG Index Statistics:');
    console.log(`Total documents: ${stats.totalDocuments}`);
    console.log(`Total chunks: ${stats.totalChunks}\n`);
  });

// Workflow commands
const workflowCmd = program.command('workflow').description('Workflow management commands');

workflowCmd
  .command('list')
  .description('List all workflows')
  .action(async () => {
    console.log('Listing workflows...');
    console.log('Note: Workflow management requires frontend implementation');
  });

// Parse arguments
program.parse();

// Show help if no command provided
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
