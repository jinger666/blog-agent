/**
 * Dify工作流服务
 * 集成Dify API用于执行和管理AI工作流
 */

import axios, { AxiosInstance } from 'axios';
import { logger } from '../utils/logger';

interface DifyConfig {
  apiUrl: string;
  apiKey: string;
  workflowId?: string;
}

interface WorkflowInputs {
  [key: string]: any;
}

interface WorkflowExecutionResult {
  workflow_run_id: string;
  task_id: string;
  data: {
    outputs: any;
    status: 'succeeded' | 'failed' | 'running';
    elapsed_time: number;
    total_tokens: number;
    created_at: number;
  };
}

interface WorkflowStatus {
  id: string;
  workflow_id: string;
  status: 'running' | 'succeeded' | 'failed';
  outputs?: any;
  error?: string;
  elapsed_time: number;
  created_at: number;
  finished_at?: number;
}

class DifyService {
  private client: AxiosInstance;
  private config: DifyConfig;

  constructor() {
    this.config = {
      apiUrl: process.env.DIFY_API_URL || 'https://api.dify.ai/v1',
      apiKey: process.env.DIFY_API_KEY || '',
      workflowId: process.env.DIFY_WORKFLOW_ID || undefined,
    };

    this.client = axios.create({
      baseURL: this.config.apiUrl,
      headers: {
        'Authorization': `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
      },
      timeout: 60000, // 60秒超时
    });

    // 添加请求拦截器
    this.client.interceptors.request.use(
      (config) => {
        logger.info('Dify API Request', { 
          method: config.method, 
          url: config.url 
        });
        return config;
      },
      (error) => {
        logger.error('Dify API Request Error', { error: error.message });
        return Promise.reject(error);
      }
    );

    // 添加响应拦截器
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        logger.error('Dify API Response Error', {
          status: error.response?.status,
          message: error.response?.data?.message || error.message,
        });
        return Promise.reject(error);
      }
    );
  }

  /**
   * 执行工作流
   * @param inputs 输入参数
   * @param userId 用户标识
   * @param responseMode 响应模式: blocking 或 streaming
   * @param workflowId 可选的工作流ID（覆盖默认配置）
   */
  async executeWorkflow(
    inputs: WorkflowInputs,
    userId: string,
    responseMode: 'blocking' | 'streaming' = 'blocking',
    workflowId?: string
  ): Promise<WorkflowExecutionResult> {
    try {
      const targetWorkflowId = workflowId || this.config.workflowId;
      
      if (!targetWorkflowId) {
        throw new Error('DIFY_WORKFLOW_ID not configured');
      }

      const response = await this.client.post('/workflows/run', {
        inputs,
        response_mode: responseMode,
        user: userId,
      });

      logger.info('Dify workflow executed successfully', {
        workflowId: targetWorkflowId,
        taskId: response.data.task_id,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to execute Dify workflow', {
        error: error.message,
        response: error.response?.data,
      });
      throw new Error(`Dify workflow execution failed: ${error.message}`);
    }
  }

  /**
   * 获取工作流执行状态
   * @param taskId 任务ID
   */
  async getWorkflowStatus(taskId: string): Promise<WorkflowStatus> {
    try {
      const response = await this.client.get(`/workflows/run/${taskId}`);
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get workflow status', {
        taskId,
        error: error.message,
      });
      throw new Error(`Failed to get workflow status: ${error.message}`);
    }
  }

  /**
   * 停止正在运行的工作流
   * @param taskId 任务ID
   * @param userId 用户标识
   */
  async stopWorkflow(taskId: string, userId: string): Promise<{ result: string }> {
    try {
      const response = await this.client.post('/workflows/stop', {
        task_id: taskId,
        user: userId,
      });
      
      logger.info('Dify workflow stopped', { taskId });
      return response.data;
    } catch (error: any) {
      logger.error('Failed to stop workflow', {
        taskId,
        error: error.message,
      });
      throw new Error(`Failed to stop workflow: ${error.message}`);
    }
  }

  /**
   * 获取工作流日志
   */
  async getWorkflowLogs(): Promise<any> {
    try {
      const response = await this.client.get('/workflows/logs');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get workflow logs', {
        error: error.message,
      });
      throw new Error(`Failed to get workflow logs: ${error.message}`);
    }
  }

  /**
   * 获取应用信息
   */
  async getAppInfo(): Promise<any> {
    try {
      const response = await this.client.get('/info');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get app info', {
        error: error.message,
      });
      throw new Error(`Failed to get app info: ${error.message}`);
    }
  }

  /**
   * 获取应用参数
   */
  async getAppParameters(): Promise<any> {
    try {
      const response = await this.client.get('/parameters');
      return response.data;
    } catch (error: any) {
      logger.error('Failed to get app parameters', {
        error: error.message,
      });
      throw new Error(`Failed to get app parameters: ${error.message}`);
    }
  }

  /**
   * 上传文件（用于文件类型的工作流输入）
   * @param fileBuffer 文件缓冲
   * @param fileName 文件名
   * @param userId 用户标识
   */
  async uploadFile(
    fileBuffer: Buffer,
    fileName: string,
    userId: string
  ): Promise<{ id: string; name: string }> {
    try {
      const FormData = require('form-data');
      const formData = new FormData();
      formData.append('file', fileBuffer, {
        filename: fileName,
        contentType: 'application/octet-stream',
      });
      formData.append('user', userId);

      const response = await this.client.post('/files/upload', formData, {
        headers: formData.getHeaders(),
      });

      logger.info('File uploaded to Dify', {
        fileId: response.data.id,
        fileName,
      });

      return response.data;
    } catch (error: any) {
      logger.error('Failed to upload file', {
        fileName,
        error: error.message,
      });
      throw new Error(`Failed to upload file: ${error.message}`);
    }
  }

  /**
   * 检查Dify服务是否可用
   */
  async healthCheck(): Promise<boolean> {
    try {
      await this.getAppInfo();
      return true;
    } catch (error) {
      logger.warn('Dify health check failed', { error });
      return false;
    }
  }

  /**
   * 获取配置信息（用于前端显示）
   */
  getConfig() {
    return {
      apiUrl: this.config.apiUrl,
      hasApiKey: !!this.config.apiKey,
      workflowId: this.config.workflowId,
    };
  }
}

// 导出单例
export const difyService = new DifyService();
