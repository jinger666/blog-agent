import { Controller, Post, Get, Body, Param, Query, UseGuards } from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';

@Controller('api/agent')
export class AgentController {
  constructor(private agentService: AgentService) {}

  @Post('chat')
  async chat(@Body() body: any) {
    const { message, sessionId, context, userId = 'anonymous' } = body;

    if (!message) {
      return {
        success: false,
        error: 'Message is required',
      };
    }

    try {
      const result = await this.agentService.chat(message, sessionId, context, userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Post('execute')
  async execute(@Body() body: any) {
    const { skill, input, userId = 'anonymous' } = body;

    if (!skill) {
      return {
        success: false,
        error: 'Skill name is required',
      };
    }

    try {
      const result = await this.agentService.executeSkill(skill, input, userId);
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sessions')
  async listSessions(@Query('userId') userId = 'anonymous', @Query('limit') limit: any = 10) {
    try {
      const result = await this.agentService.listSessions(userId, parseInt(limit));
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }

  @Get('sessions/:id')
  async getSessionHistory(@Param('id') id: string, @Query('limit') limit?: string) {
    try {
      const result = await this.agentService.getSessionHistory(
        id,
        limit ? parseInt(limit) : undefined
      );
      return {
        success: true,
        data: result,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
}
