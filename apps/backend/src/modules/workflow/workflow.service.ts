import { Injectable, Logger } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Workflow, WorkflowDocument } from './schemas/workflow.schema';
import { workflowEngine } from '../../agent/workflow/workflowEngine';
import { difyService } from '../../services/difyService';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    @InjectModel(Workflow.name) private workflowModel: Model<WorkflowDocument>,
  ) {}

  async listWorkflows(userId: string = 'anonymous') {
    try {
      const workflows = await this.workflowModel.find({ userId })
        .sort({ createdAt: -1 })
        .select('-nodes -edges');

      return { workflows };
    } catch (error: any) {
      this.logger.error(`Error listing workflows: ${error.message}`);
      throw error;
    }
  }

  async createWorkflow(name: string, nodes: any[], edges: any[], userId: string = 'anonymous', description = '') {
    try {
      const workflow = await this.workflowModel.create({
        id: uuidv4(),
        userId,
        name,
        description,
        nodes,
        edges,
      });

      return {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
          createdAt: (workflow as any).createdAt,
        },
        message: 'Workflow created successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error creating workflow: ${error.message}`);
      throw error;
    }
  }

  async updateWorkflow(id: string, updates: any) {
    try {
      const workflow = await this.workflowModel.findOneAndUpdate(
        { id },
        { ...updates, updatedAt: new Date() },
        { new: true }
      );

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return {
        workflow: {
          id: workflow.id,
          name: workflow.name,
          description: workflow.description,
        },
        message: 'Workflow updated successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error updating workflow: ${error.message}`);
      throw error;
    }
  }

  async deleteWorkflow(id: string) {
    try {
      const workflow = await this.workflowModel.findOneAndDelete({ id });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      return {
        message: 'Workflow deleted successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error deleting workflow: ${error.message}`);
      throw error;
    }
  }

  async executeWorkflow(id: string, initialData?: any) {
    try {
      const workflow = await this.workflowModel.findOne({ id });

      if (!workflow) {
        throw new Error('Workflow not found');
      }

      const execution = await workflowEngine.executeWorkflow(
        id,
        workflow.nodes as any,
        workflow.edges as any,
        initialData
      );

      return {
        executionId: execution.id,
        status: execution.status,
        startTime: execution.startTime,
      };
    } catch (error: any) {
      this.logger.error(`Error executing workflow: ${error.message}`);
      throw error;
    }
  }

  async getExecutions(workflowId: string) {
    try {
      const executions = workflowEngine.getAllExecutions(workflowId);

      return {
        executions,
        count: executions.length,
      };
    } catch (error: any) {
      this.logger.error(`Error getting executions: ${error.message}`);
      throw error;
    }
  }

  // Dify Integration Methods
  async executeDifyWorkflow(inputs: any, userId: string = 'anonymous', responseMode: 'blocking' | 'streaming' = 'blocking', workflowId?: string): Promise<any> {
    try {
      const result = await difyService.executeWorkflow(inputs, userId, responseMode, workflowId);

      return {
        success: true,
        data: result,
        message: 'Dify workflow executed successfully',
      };
    } catch (error: any) {
      this.logger.error(`Error executing Dify workflow: ${error.message}`);
      throw error;
    }
  }

  async getDifyStatus(taskId: string): Promise<any> {
    try {
      const status = await difyService.getWorkflowStatus(taskId);

      return {
        success: true,
        data: status,
      };
    } catch (error: any) {
      this.logger.error(`Error getting Dify status: ${error.message}`);
      throw error;
    }
  }

  async stopDifyWorkflow(taskId: string, userId: string = 'anonymous') {
    try {
      const result = await difyService.stopWorkflow(taskId, userId);

      return {
        success: true,
        data: result,
        message: 'Dify workflow stopped',
      };
    } catch (error: any) {
      this.logger.error(`Error stopping Dify workflow: ${error.message}`);
      throw error;
    }
  }

  async getDifyInfo() {
    try {
      const info = await difyService.getAppInfo();

      return {
        success: true,
        data: info,
      };
    } catch (error: any) {
      this.logger.error(`Error getting Dify info: ${error.message}`);
      throw error;
    }
  }

  async getDifyParameters() {
    try {
      const parameters = await difyService.getAppParameters();

      return {
        success: true,
        data: parameters,
      };
    } catch (error: any) {
      this.logger.error(`Error getting Dify parameters: ${error.message}`);
      throw error;
    }
  }

  async checkDifyHealth() {
    try {
      const isHealthy = await difyService.healthCheck();
      const config = difyService.getConfig();

      return {
        success: true,
        healthy: isHealthy,
        config,
        message: isHealthy ? 'Dify service is available' : 'Dify service is not available',
      };
    } catch (error: any) {
      this.logger.error(`Error checking Dify health: ${error.message}`);
      throw error;
    }
  }
}
