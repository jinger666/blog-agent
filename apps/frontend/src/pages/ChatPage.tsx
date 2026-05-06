import React, { useState } from 'react';
import { Card, Input, Button, Space, Upload, message, Select, Tabs } from 'antd';
import { SendOutlined, PaperClipOutlined, BulbOutlined, FileTextOutlined } from '@ant-design/icons';
import { useChatStore } from '../stores/chatStore';
import apiClient from '../api/client';
import { v4 as uuidv4 } from 'uuid';

const { TextArea } = Input;
const { Option } = Select;

const ChatPage: React.FC = () => {
  const [inputValue, setInputValue] = useState('');
  const [activeTab, setActiveTab] = useState('chat');
  const [selectedSkill, setSelectedSkill] = useState('title_generator');
  const [skillInput, setSkillInput] = useState('');
  const [skillResult, setSkillResult] = useState<any>(null);
  const [isExecutingSkill, setIsExecutingSkill] = useState(false);
  const { messages, sessionId, isLoading, addMessage, setLoading, setSessionId } = useChatStore();

  const skills = [
    { value: 'title_generator', label: '标题生成器' },
    { value: 'content_outliner', label: '内容大纲生成器' },
    { value: 'mindmap_generator', label: '思维导图生成器' },
    { value: 'seo_optimizer', label: 'SEO优化器' },
    { value: 'csdn_formatter', label: 'CSDN格式化器' },
    { value: 'text_analyzer', label: '文本分析器' },
    { value: 'text_summarizer', label: '文本摘要器' },
  ];

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    const userMessage = {
      id: uuidv4(),
      role: 'user' as const,
      content: inputValue,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setInputValue('');
    setLoading(true);

    try {
      const response = await apiClient.post('/agent/chat', {
        message: inputValue,
        sessionId: sessionId || uuidv4(),
        userId: 'anonymous',
      });

      if (!sessionId) {
        setSessionId(response.data.sessionId);
      }

      const assistantMessage = {
        id: uuidv4(),
        role: 'assistant' as const,
        content: response.data.response,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '发送消息失败');
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteSkill = async () => {
    if (!skillInput.trim()) {
      message.warning('请输入技能的输入内容');
      return;
    }

    setIsExecutingSkill(true);
    setSkillResult(null);

    try {
      const response = await apiClient.post('/agent/execute', {
        skill: selectedSkill,
        input: skillInput,
        userId: 'anonymous',
      });

      setSkillResult(response.data.result);
      message.success('技能执行成功');
    } catch (error: any) {
      message.error(error.response?.data?.error?.message || '技能执行失败');
    } finally {
      setIsExecutingSkill(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const renderSkillResult = () => {
    if (!skillResult) return null;

    return (
      <Card style={{ marginTop: 16 }}>
        <h3>结果：</h3>
        <pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: 16, borderRadius: 4 }}>
          {typeof skillResult === 'object' ? JSON.stringify(skillResult, null, 2) : skillResult}
        </pre>
      </Card>
    );
  };

  return (
    <div style={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <h1 style={{ marginBottom: 16 }}>AI博客助手</h1>
      
      <Tabs activeKey={activeTab} onChange={setActiveTab}>
        <Tabs.TabPane tab="对话" key="chat">
          <Card style={{ height: 'calc(100vh - 350px)', display: 'flex', flexDirection: 'column' }}>
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 16 }}>
              {messages.length === 0 ? (
                <div style={{ textAlign: 'center', color: '#999', padding: '40px 0' }}>
                  <BulbOutlined style={{ fontSize: 48, marginBottom: 16 }} />
                  <p>开始与AI助手对话</p>
                  <p style={{ fontSize: '12px' }}>询问博客写作、内容创意或编辑方面的帮助</p>
                </div>
              ) : (
                messages.map((msg) => (
                  <div
                    key={msg.id}
                    style={{
                      marginBottom: 16,
                      textAlign: msg.role === 'user' ? 'right' : 'left',
                    }}
                  >
                    <div
                      style={{
                        display: 'inline-block',
                        padding: '12px 16px',
                        borderRadius: '8px',
                        background: msg.role === 'user' ? '#1890ff' : '#f0f0f0',
                        color: msg.role === 'user' ? 'white' : 'black',
                        maxWidth: '70%',
                      }}
                    >
                      <p style={{ margin: 0, whiteSpace: 'pre-wrap' }}>{msg.content}</p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <Space.Compact style={{ width: '100%' }}>
              <Upload showUploadList={false} beforeUpload={() => false}>
                <Button icon={<PaperClipOutlined />} />
              </Upload>
              <TextArea
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="输入您的消息..."
                autoSize={{ minRows: 1, maxRows: 4 }}
                disabled={isLoading}
              />
              <Button
                type="primary"
                icon={<SendOutlined />}
                onClick={handleSend}
                loading={isLoading}
              >
                发送
              </Button>
            </Space.Compact>
          </Card>
        </Tabs.TabPane>

        <Tabs.TabPane tab="技能" key="skills">
          <Card>
            <Space direction="vertical" style={{ width: '100%' }} size="large">
              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  选择技能：
                </label>
                <Select
                  value={selectedSkill}
                  onChange={setSelectedSkill}
                  style={{ width: '100%' }}
                  options={skills}
                />
              </div>

              <div>
                <label style={{ display: 'block', marginBottom: 8, fontWeight: 'bold' }}>
                  输入内容：
                </label>
                <TextArea
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  placeholder="输入主题或内容..."
                  rows={6}
                />
              </div>

              <Button
                type="primary"
                icon={<FileTextOutlined />}
                onClick={handleExecuteSkill}
                loading={isExecutingSkill}
                block
              >
                执行技能
              </Button>

              {renderSkillResult()}
            </Space>
          </Card>
        </Tabs.TabPane>
      </Tabs>
    </div>
  );
};

export default ChatPage;
