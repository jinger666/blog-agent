import { logger } from '../../utils/logger';
import { getAgent } from '../core/blogAgent';
import { shortTermMemory } from '../memory/shortTermMemory';

export interface WorkflowNode {
  id: string;
  type: 'start' | 'llm' | 'tool' | 'condition' | 'loop' | 'memory' | 'end';
  data: Record<string, any>;
}

export interface WorkflowEdge {
  id: string;
  source: string;
  target: string;
}

export interface WorkflowExecution {
  id: string;
  workflowId: string;
  status: 'running' | 'completed' | 'failed';
  startTime: Date;
  endTime?: Date;
  result?: any;
  error?: string;
}

class WorkflowEngine {
  private executions: Map<string, WorkflowExecution> = new Map();

  async executeWorkflow(
    workflowId: string,
    nodes: WorkflowNode[],
    edges: WorkflowEdge[],
    initialData?: any
  ): Promise<WorkflowExecution> {
    const executionId = `exec-${Date.now()}`;
    const execution: WorkflowExecution = {
      id: executionId,
      workflowId,
      status: 'running',
      startTime: new Date(),
    };

    this.executions.set(executionId, execution);

    try {
      logger.info(`Executing workflow ${workflowId} (execution: ${executionId})`);

      // Find start node
      const startNode = nodes.find((n) => n.type === 'start');
      if (!startNode) {
        throw new Error('Workflow must have a start node');
      }

      // Execute nodes in order
      let currentNodeId = startNode.id;
      let currentData = initialData || {};
      const visitedNodes = new Set<string>();

      while (currentNodeId && !visitedNodes.has(currentNodeId)) {
        visitedNodes.add(currentNodeId);
        const node = nodes.find((n) => n.id === currentNodeId);

        if (!node) {
          break;
        }

        logger.debug(`Executing node: ${node.id} (${node.type})`);

        // Execute node based on type
        const result = await this.executeNode(node, currentData);
        currentData = { ...currentData, ...result };

        // Find next node
        const edge = edges.find((e) => e.source === currentNodeId);
        currentNodeId = edge ? edge.target : null;

        // Check for end node
        if (node.type === 'end') {
          break;
        }
      }

      execution.status = 'completed';
      execution.endTime = new Date();
      execution.result = currentData;

      logger.info(`Workflow ${workflowId} completed successfully`);
      return execution;
    } catch (error: any) {
      execution.status = 'failed';
      execution.endTime = new Date();
      execution.error = error.message;

      logger.error(`Workflow ${workflowId} failed:`, error);
      throw error;
    }
  }

  private async executeNode(node: WorkflowNode, inputData: any): Promise<any> {
    switch (node.type) {
      case 'start':
        return { startedAt: new Date() };

      case 'llm':
        return await this.executeLLMNode(node, inputData);

      case 'tool':
        return await this.executeToolNode(node, inputData);

      case 'memory':
        return await this.executeMemoryNode(node, inputData);

      case 'condition':
        return await this.executeConditionNode(node, inputData);

      case 'end':
        return { completedAt: new Date() };

      default:
        logger.warn(`Unknown node type: ${node.type}`);
        return {};
    }
  }

  private async executeLLMNode(node: WorkflowNode, inputData: any): Promise<any> {
    const agent = getAgent();
    const prompt = node.data.prompt || 'Process the input';
    const input = node.data.inputVariable ? inputData[node.data.inputVariable] : JSON.stringify(inputData);

    const result = await agent.chat(prompt + '\n\nInput: ' + input, []);

    return {
      llmResponse: result.response,
      [node.data.outputVariable || 'output']: result.response,
    };
  }

  private async executeToolNode(node: WorkflowNode, inputData: any): Promise<any> {
    const agent = getAgent();
    const toolName = node.data.toolName;
    const toolInput = node.data.inputVariable ? inputData[node.data.inputVariable] : inputData;

    const result = await agent.executeSkill(toolName, toolInput);

    return {
      toolResult: result,
      [node.data.outputVariable || 'output']: result,
    };
  }

  private async executeMemoryNode(node: WorkflowNode, inputData: any): Promise<any> {
    const action = node.data.action || 'store';
    const content = node.data.contentVariable ? inputData[node.data.contentVariable] : JSON.stringify(inputData);

    if (action === 'store') {
      await shortTermMemory.addMessage('workflow-memory', {
        role: 'system',
        content,
        timestamp: new Date(),
      });

      return { memoryStored: true };
    } else if (action === 'retrieve') {
      const messages = await shortTermMemory.getMessages('workflow-memory', 5);
      return { retrievedMemories: messages };
    }

    return {};
  }

  private async executeConditionNode(node: WorkflowNode, inputData: any): Promise<any> {
    const condition = node.data.condition;
    
    // Simple condition evaluation (in production, use a proper expression evaluator)
    let result = false;
    
    if (condition?.type === 'exists') {
      result = !!inputData[condition.variable];
    } else if (condition?.type === 'equals') {
      result = inputData[condition.variable] === condition.value;
    } else if (condition?.type === 'contains') {
      result = String(inputData[condition.variable] || '').includes(condition.value);
    }

    return {
      conditionResult: result,
      [node.data.outputVariable || 'conditionMet']: result,
    };
  }

  getExecution(executionId: string): WorkflowExecution | undefined {
    return this.executions.get(executionId);
  }

  getAllExecutions(workflowId?: string): WorkflowExecution[] {
    const executions = Array.from(this.executions.values());
    
    if (workflowId) {
      return executions.filter((e) => e.workflowId === workflowId);
    }
    
    return executions;
  }
}

export const workflowEngine = new WorkflowEngine();
