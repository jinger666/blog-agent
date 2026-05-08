import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Button, message as antMessage } from 'antd';
import { CopyOutlined, CheckOutlined, UserOutlined, RobotOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface ChatMessageProps {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

const ChatMessage: React.FC<ChatMessageProps> = ({ role, content, timestamp }) => {
  const [copied, setCopied] = useState(false);
  const isUser = role === 'user';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setCopied(true);
      antMessage.success('已复制到剪贴板');
      setTimeout(() => setCopied(false), 2000);
    } catch {
      antMessage.error('复制失败');
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: isUser ? 'row-reverse' : 'row',
      alignItems: 'flex-start',
      gap: 12,
      marginBottom: 20,
      padding: '0 4px',
    }}>
      {/* Avatar */}
      <div style={{
        width: 36, height: 36, borderRadius: '50%',
        background: isUser
          ? 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'
          : 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 16, flexShrink: 0,
        boxShadow: isUser
          ? '0 2px 8px rgba(22,119,255,0.3)'
          : '0 2px 8px rgba(102,126,234,0.3)',
      }}>
        {isUser ? <UserOutlined /> : <RobotOutlined />}
      </div>

      {/* Content */}
      <div style={{
        maxWidth: '72%',
        minWidth: 120,
      }}>
        {/* Role label */}
        <div style={{
          fontSize: 12, color: '#8c8c8c', marginBottom: 4,
          textAlign: isUser ? 'right' : 'left',
          padding: isUser ? '0 8px 0 0' : '0 0 0 8px',
        }}>
          {isUser ? 'You' : 'DeepSeek AI'}
        </div>

        {/* Bubble */}
        <div
          style={{
            background: isUser
              ? 'linear-gradient(135deg, #1677ff 0%, #4096ff 100%)'
              : '#ffffff',
            color: isUser ? '#fff' : '#1f2937',
            borderRadius: isUser ? '16px 4px 16px 16px' : '4px 16px 16px 16px',
            padding: '14px 18px',
            boxShadow: isUser
              ? '0 2px 12px rgba(22,119,255,0.25)'
              : '0 2px 12px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
            border: isUser ? 'none' : '1px solid #f0f0f0',
            lineHeight: 1.7,
          }}
        >
          {isUser ? (
            <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>
          ) : (
            <div className="markdown-content">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>
                {content}
              </ReactMarkdown>
            </div>
          )}
        </div>

        {/* Footer: timestamp + copy */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginTop: 4,
          justifyContent: isUser ? 'flex-end' : 'flex-start',
          padding: isUser ? '0 8px 0 0' : '0 0 0 8px',
        }}>
          <span style={{ fontSize: 11, color: '#bbb' }}>
            {dayjs(timestamp).format('HH:mm')}
          </span>
          {!isUser && (
            <Button
              type="text"
              size="small"
              icon={copied ? <CheckOutlined style={{ color: '#52c41a' }} /> : <CopyOutlined />}
              onClick={handleCopy}
              style={{ fontSize: 12, color: '#999', padding: '0 4px', height: 22 }}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
