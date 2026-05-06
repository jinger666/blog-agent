import React, { useState } from 'react';
import { Tabs, Card, Button, Form, Input, Select, message, Table, Tag, Modal } from 'antd';
import { PlayCircleOutlined, InfoCircleOutlined } from '@ant-design/icons';
import DifyWorkflowEditor from '../components/DifyWorkflowEditor';
import apiClient from '../api/client';
import { useAuthStore } from '../stores/authStore';

const { TextArea } = Input;

interface WorkflowExecution {
  task_id: string;
  inputs: any;
  outputs?: any;
  status: 'running' | 'succeeded' | 'failed';
  created_at: string;
  elapsed_time?: number;
}

const DifyWorkflowPage: React.FC = () => {
  const { user } = useAuthStore();
  const [form] = Form.useForm();
  const [loading, setLoading] = useState(false);
  const [executions, setExecutions] = useState<WorkflowExecution[]>([]);
  const [difyInfo, setDifyInfo] = useState<any>(null);
  const [isInfoModalVisible, setIsInfoModalVisible] = useState(false);

  const loadDifyInfo = async () => {
    try {
      const response = await apiClient.get('/workflows/dify/info');
      setDifyInfo(response.data.data);
    } catch (error) {
      console.log('Dify info not available (may not be configured)');
    }
  };

  const handleExecute = async (values: any) => {
    setLoading(true);
    
    try {
      // 解析JSON输入
      let inputs;
      try {
        inputs = JSON.parse(values.inputs);
      } catch (e) {
        message.error('输入必须是有效的JSON格式');
        setLoading(false);
        return;
      }

      const response = await apiClient.post('/workflows/dify/execute', {
        inputs,
        userId: user?.id || 'anonymous',
        responseMode: values.responseMode || 'blocking',
        workflowId: values.workflowId || undefined,
      });

      message.success('工作流执行成功！');
      
      // 添加到执行列表
      const newExecution: WorkflowExecution = {
        task_id: response.data.data.task_id,
        inputs: inputs,
        outputs: response.data.data.data?.outputs,
        status: response.data.data.data?.status || 'succeeded',
        created_at: new Date().toISOString(),
        elapsed_time: response.data.data.data?.elapsed_time,
      };
      
      setExecutions([newExecution, ...executions]);
      form.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || '工作流执行失败');
    } finally {
      setLoading(false);
    }
  };

  const handleRefreshStatus = async (taskId: string) => {
    try {
      const response = await apiClient.get(`/workflows/dify/status/${taskId}`);
      
      setExecutions(executions.map(exec => 
        exec.task_id === taskId 
          ? {
              ...exec,
              status: response.data.data.status,
              outputs: response.data.data.outputs,
              elapsed_time: response.data.data.elapsed_time,
            }
          : exec
      ));
      
      message.success('状态已更新');
    } catch (error: any) {
      message.error('获取状态失败');
    }
  };

  const columns = [
    {
      title: '任务ID',
      dataIndex: 'task_id',
      key: 'task_id',
      ellipsis: true,
      width: 200,
    },
    {
      title: '输入',
      dataIndex: 'inputs',
      key: 'inputs',
      ellipsis: true,
      render: (inputs: any) => (
        <span style={{ fontSize: 12 }}>
          {JSON.stringify(inputs).substring(0, 50)}...
        </span>
      ),
    },
    {
      title: '输出',
      dataIndex: 'outputs',
      key: 'outputs',
      ellipsis: true,
      render: (outputs: any) => (
        outputs ? (
          <span style={{ fontSize: 12 }}>
            {JSON.stringify(outputs).substring(0, 50)}...
          </span>
        ) : '-'
      ),
    },
    {
      title: '状态',
      dataIndex: 'status',
      key: 'status',
      width: 120,
      render: (status: string) => {
        const colorMap: any = {
          running: 'processing',
          succeeded: 'success',
          failed: 'error',
        };
        const textMap: any = {
          running: '运行中',
          succeeded: '成功',
          failed: '失败',
        };
        return <Tag color={colorMap[status]}>{textMap[status]}</Tag>;
      },
    },
    {
      title: '耗时(秒)',
      dataIndex: 'elapsed_time',
      key: 'elapsed_time',
      width: 100,
      render: (time: number) => time ? time.toFixed(2) : '-',
    },
    {
      title: '操作',
      key: 'action',
      width: 120,
      render: (_: any, record: WorkflowExecution) => (
        <Button
          type="link"
          size="small"
          onClick={() => handleRefreshStatus(record.task_id)}
        >
          刷新状态
        </Button>
      ),
    },
  ];

  return (
    <DifyWorkflowEditor />
  );
};

export default DifyWorkflowPage;
