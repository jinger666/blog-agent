import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Workflow, WorkflowNode, WorkflowEdge, ApiResponse } from '@ai-blog/types';

@Controller('api/workflows')
export class WorkflowController {
  @Get()
  getAll(): ApiResponse<Workflow[]> {
    return { success: true, data: [] };
  }

  @Post()
  create(@Body() workflowData: any): ApiResponse<Workflow> {
    return { success: true, data: workflowData };
  }

  @Get(':id')
  getById(@Param('id') id: string): ApiResponse<Workflow> {
    return { success: true, data: null };
  }
}
