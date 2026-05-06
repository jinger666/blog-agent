import React, { useEffect, useState } from 'react';
import { Card, Row, Col, Statistic, List, Tag } from 'antd';
import { MessageOutlined, BranchesOutlined, DatabaseOutlined, BookOutlined, FileTextOutlined } from '@ant-design/icons';
import apiClient from '../api/client';

const Dashboard: React.FC = () => {
  const [stats, setStats] = useState({
    sessions: 0,
    memories: 0,
    documents: 0,
    chunks: 0,
  });

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const [memoryStats, ragStats] = await Promise.all([
        apiClient.get('/memory/stats?userId=anonymous'),
        apiClient.get('/rag/stats'),
      ]);

      setStats({
        sessions: 0,
        memories: memoryStats.data.total || 0,
        documents: ragStats.data.totalDocuments || 0,
        chunks: ragStats.data.totalChunks || 0,
      });
    } catch (error) {
      console.error('Failed to load stats:', error);
    }
  };

  const quickActions = [
    {
      title: '开始对话',
      description: '与AI助手聊天获取博客创意',
      icon: <MessageOutlined />,
      path: '/chat',
      color: 'blue',
    },
    {
      title: '生成标题',
      description: '立即创建吸引人的博客标题',
      icon: <BookOutlined />,
      path: '/chat?tab=skills',
      color: 'green',
    },
    {
      title: '查看记忆',
      description: '管理您的知识库',
      icon: <DatabaseOutlined />,
      path: '/memories',
      color: 'purple',
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>控制台</h1>
      
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="存储记忆"
              value={stats.memories}
              prefix={<DatabaseOutlined />}
              valueStyle={{ color: '#3f8600' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="索引文档"
              value={stats.documents}
              prefix={<BookOutlined />}
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="文档分块"
              value={stats.chunks}
              prefix={<FileTextOutlined />}
              valueStyle={{ color: '#cf1322' }}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} lg={6}>
          <Card>
            <Statistic
              title="活跃会话"
              value={stats.sessions}
              prefix={<MessageOutlined />}
            />
          </Card>
        </Col>
      </Row>
      
      <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
        <Col span={24}>
          <Card title="快捷操作">
            <List
              grid={{ gutter: 16, column: 3 }}
              dataSource={quickActions}
              renderItem={(item) => (
                <List.Item>
                  <Card hoverable onClick={() => window.location.href = item.path}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8, color: item.color }}>
                        {item.icon}
                      </div>
                      <h3 style={{ margin: '0 0 8px 0' }}>{item.title}</h3>
                      <p style={{ color: '#999', fontSize: 12, margin: 0 }}>
                        {item.description}
                      </p>
                    </div>
                  </Card>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>

      <Card style={{ marginTop: 24 }}>
        <h3>欢迎使用AI博客平台</h3>
        <p>本平台提供AI驱动的博客创作工具，包括：</p>
        <ul style={{ lineHeight: 2 }}>
          <li><Tag color="blue">多模态对话</Tag> - 与AI助手聊天获取内容创意和写作帮助</li>
          <li><Tag color="green">智能技能</Tag> - 生成标题、大纲、思维导图和SEO分析</li>
          <li><Tag color="purple">记忆系统</Tag> - 跨会话存储和检索知识</li>
          <li><Tag color="orange">RAG系统</Tag> - 索引文档并进行上下文查询</li>
          <li><Tag color="magenta">工作流</Tag> - 执行Dify AI工作流</li>
          <li><Tag color="red">CLI工具</Tag> - 通过命令行管理平台</li>
        </ul>
        <div style={{ marginTop: 16, padding: 16, background: '#f5f5f5', borderRadius: 4 }}>
          <strong>💡 提示：</strong>从与AI助手聊天开始，或使用技能选项卡生成博客标题和大纲！
        </div>
      </Card>
    </div>
  );
};

export default Dashboard;
