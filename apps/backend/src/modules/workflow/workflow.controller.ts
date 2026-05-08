import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { WorkflowService } from './workflow.service';

@Controller('api/workflows')
export class WorkflowController {
  constructor(private workflowService: WorkflowService) {}

  @Get()
  async listWorkflows(@Query('userId') userId = 'anonymous') {
    try {
      const result = await this.workflowService.listWorkflows(userId);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post()
  async createWorkflow(@Body() body: any) {
    const { name, description, nodes, edges, userId = 'anonymous' } = body;

    if (!name || !nodes || !edges) {
      return { success: false, error: 'Name, nodes, and edges are required' };
    }

    try {
      const result = await this.workflowService.createWorkflow(name, nodes, edges, userId, description);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Put(':id')
  async updateWorkflow(@Param('id') id: string, @Body() updates: any) {
    try {
      const result = await this.workflowService.updateWorkflow(id, updates);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Delete(':id')
  async deleteWorkflow(@Param('id') id: string) {
    try {
      const result = await this.workflowService.deleteWorkflow(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post(':id/execute')
  async executeWorkflow(@Param('id') id: string, @Body() body: any) {
    const { initialData } = body;

    try {
      const result = await this.workflowService.executeWorkflow(id, initialData);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get(':id/executions')
  async getExecutions(@Param('id') id: string) {
    try {
      const result = await this.workflowService.getExecutions(id);
      return { success: true, data: result };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  // Dify endpoints
  @Post('dify/execute')
  async executeDify(@Body() body: any): Promise<any> {
    const { inputs, userId = 'anonymous', responseMode = 'blocking', workflowId } = body;

    if (!inputs) {
      return { success: false, error: 'Inputs are required' };
    }

    try {
      const result = await this.workflowService.executeDifyWorkflow(inputs, userId, responseMode, workflowId);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('dify/status/:taskId')
  async getDifyStatus(@Param('taskId') taskId: string): Promise<any> {
    try {
      const result = await this.workflowService.getDifyStatus(taskId);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Post('dify/stop/:taskId')
  async stopDify(@Param('taskId') taskId: string, @Body() body: any) {
    const { userId = 'anonymous' } = body;

    try {
      const result = await this.workflowService.stopDifyWorkflow(taskId, userId);
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('dify/info')
  async getDifyInfo() {
    try {
      const result = await this.workflowService.getDifyInfo();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('dify/parameters')
  async getDifyParameters() {
    try {
      const result = await this.workflowService.getDifyParameters();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  @Get('dify/health')
  async checkDifyHealth() {
    try {
      const result = await this.workflowService.checkDifyHealth();
      return result;
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}
