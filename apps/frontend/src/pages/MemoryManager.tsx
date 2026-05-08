import React, { useState, useEffect } from 'react';
import { Card, Input, Button, Table, Tag, Space, Modal, Form, App } from 'antd';
import { SearchOutlined, PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import apiClient from '../api/client';

const { TextArea } = Input;

interface Memory {
  id: string;
  content: string;
  category: string;
  importance: number;
  similarity?: number;
  createdAt: string;
}

const MemoryManager: React.FC = () => {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [form] = Form.useForm();
  const { message } = App.useApp();

  useEffect(() => {
    loadMemories();
  }, []);

  const loadMemories = async () => {
    setLoading(true);
    try {
      const response = await apiClient.get('/memory/stats?userId=anonymous');
      message.info(`总记忆数：${response.data.total}`);
    } catch (error) {
      console.error('Failed to load memories:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      message.warning('请输入搜索查询');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.get(`/memory/search?q=${encodeURIComponent(searchQuery)}&userId=anonymous`);
      setMemories(response.data.memories || []);
      message.success(`找到 ${response.data.count} 条记忆`);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '搜索失败');
    } finally {
      setLoading(false);
    }
  };

  const handleAddMemory = async (values: any) => {
    try {
      await apiClient.post('/memory/store', {
        content: values.content,
        category: values.category,
        userId: 'anonymous',
      });
      message.success('记忆存储成功');
      setIsModalVisible(false);
      form.resetFields();
      if (searchQuery) {
        handleSearch();
      }
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '存储记忆失败');
    }
  };

  const handleDelete = async (id: string) => {
    Modal.confirm({
      title: '删除记忆',
      content: '您确定要删除这条记忆吗？',
      onOk: async () => {
        try {
          await apiClient.delete(`/memory/${id}`);
          message.success('记忆已删除');
          setMemories(memories.filter(m => m.id !== id));
        } catch (error: any) {
          message.error('删除记忆失败');
        }
      },
    });
  };

  const columns = [
    {
      title: '内容',
      dataIndex: 'content',
      key: 'content',
      ellipsis: true,
      render: (text: string) => text.substring(0, 100) + (text.length > 100 ? '...' : ''),
    },
    {
      title: '分类',
      dataIndex: 'category',
      key: 'category',
      render: (category: string) => (
        <Tag color={category === 'fact' ? 'blue' : category === 'preference' ? 'green' : 'orange'}>
          {category === 'fact' ? '事实' : category === 'preference' ? '偏好' : '历史'}
        </Tag>
      ),
    },
    {
      title: '重要性',
      dataIndex: 'importance',
      key: 'importance',
      render: (importance: number) => `${(importance * 100).toFixed(0)}%`,
    },
    {
      title: '相似度',
      dataIndex: 'similarity',
      key: 'similarity',
      render: (similarity?: number) => similarity ? `${(similarity * 100).toFixed(1)}%` : '-',
    },
    {
      title: '操作',
      key: 'actions',
      render: (_: any, record: Memory) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          onClick={() => handleDelete(record.id)}
        >
          删除
        </Button>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>记忆管理器</h1>
      
      <Card style={{ marginBottom: 16 }}>
        <Space.Compact style={{ width: '100%' }}>
          <Input
            placeholder="搜索记忆..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onPressEnter={handleSearch}
            prefix={<SearchOutlined />}
          />
          <Button type="primary" onClick={handleSearch} loading={loading}>
            搜索
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalVisible(true)}
          >
            添加记忆
          </Button>
        </Space.Compact>
      </Card>

      <Card>
        <Table
          dataSource={memories}
          columns={columns}
          rowKey="id"
          loading={loading}
          pagination={{ pageSize: 10 }}
          locale={{ emptyText: '未找到记忆。尝试搜索或添加新记忆。' }}
        />
      </Card>

      <Modal
        title="添加新记忆"
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
      >
        <Form form={form} onFinish={handleAddMemory} layout="vertical">
          <Form.Item
            name="content"
            label="内容"
            rules={[{ required: true, message: '请输入记忆内容' }]}
          >
            <TextArea rows={4} placeholder="输入记忆内容..." />
          </Form.Item>

          <Form.Item
            name="category"
            label="分类"
            rules={[{ required: true, message: '请选择分类' }]}
            initialValue="fact"
          >
            <Input.Group compact>
              <Tag.CheckableTag checked={form.getFieldValue('category') === 'fact'} onChange={() => form.setFieldValue('category', 'fact')}>
                事实
              </Tag.CheckableTag>
              <Tag.CheckableTag checked={form.getFieldValue('category') === 'preference'} onChange={() => form.setFieldValue('category', 'preference')}>
                偏好
              </Tag.CheckableTag>
              <Tag.CheckableTag checked={form.getFieldValue('category') === 'history'} onChange={() => form.setFieldValue('category', 'history')}>
                历史
              </Tag.CheckableTag>
            </Input.Group>
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" block>
              存储记忆
            </Button>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default MemoryManager;
