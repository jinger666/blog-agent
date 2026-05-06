import { Controller, Post, Body, Get, Query } from '@nestjs/common';
import { ChatRequest, ChatResponse, ApiResponse } from '@ai-blog/types';

@Controller('api/agent')
export class AgentController {
  @Post('chat')
  async chat(@Body() chatDto: ChatRequest): Promise<ApiResponse<ChatResponse>> {
    // TODO: Implement actual agent logic
    return {
      success: true,
      data: {
        response: 'Agent response placeholder',
        sessionId: chatDto.sessionId || 'default-session',
      },
    };
  }

  @Get('status')
  getStatus() {
    return { status: 'running' };
  }
}
