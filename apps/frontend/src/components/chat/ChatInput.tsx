import React, { useState, useRef, useEffect } from 'react';
import { Button, Dropdown, Tag } from 'antd';
import { SendOutlined, ThunderboltOutlined } from '@ant-design/icons';

const SKILLS = [
  { value: 'title_generator', label: '标题生成', description: 'Generate catchy blog titles' },
  { value: 'content_outliner', label: '大纲生成', description: 'Create content outlines' },
  { value: 'text_summarizer', label: '文本摘要', description: 'Summarize long texts' },
  { value: 'seo_optimizer', label: 'SEO优化', description: 'Optimize for search engines' },
  { value: 'mindmap_generator', label: '思维导图', description: 'Generate mind maps' },
  { value: 'text_analyzer', label: '文本分析', description: 'Analyze text deeply' },
];

interface ChatInputProps {
  onSend: (message: string, skill?: string) => void;
  isLoading: boolean;
}

const ChatInput: React.FC<ChatInputProps> = ({ onSend, isLoading }) => {
  const [inputValue, setInputValue] = useState('');
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = Math.min(textareaRef.current.scrollHeight, 120) + 'px';
    }
  }, [inputValue]);

  const handleSend = () => {
    const trimmed = inputValue.trim();
    if (!trimmed || isLoading) return;
    onSend(trimmed, activeSkill || undefined);
    setInputValue('');
    setActiveSkill(null);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey && !e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const skillMenuItems = SKILLS.map((skill) => ({
    key: skill.value,
    label: (
      <div style={{ padding: '4px 0' }}>
        <div style={{ fontWeight: 500 }}>{skill.label}</div>
        <div style={{ fontSize: 12, color: '#999' }}>{skill.description}</div>
      </div>
    ),
  }));

  return (
    <div style={{
      padding: '16px 20px',
      borderTop: '1px solid #f0f0f0',
      background: '#fff',
    }}>
      {/* Skill chip */}
      {activeSkill && (
        <div style={{ marginBottom: 8 }}>
          <Tag
            closable
            onClose={() => setActiveSkill(null)}
            color="purple"
            style={{ borderRadius: 6, padding: '2px 8px' }}
          >
            ⚡ {SKILLS.find((s) => s.value === activeSkill)?.label}
          </Tag>
        </div>
      )}

      {/* Input row */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {/* Skill selector */}
        <Dropdown menu={{
          items: skillMenuItems,
          onClick: ({ key }) => setActiveSkill(key),
        }} trigger={['click']} placement="topLeft">
          <Button
            icon={<ThunderboltOutlined />}
            style={{
              borderRadius: 8, flexShrink: 0,
              borderColor: activeSkill ? '#722ed1' : '#d9d9d9',
              color: activeSkill ? '#722ed1' : '#999',
            }}
          />
        </Dropdown>

        {/* Text input */}
        <textarea
          ref={textareaRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={
            activeSkill
              ? `输入${SKILLS.find((s) => s.value === activeSkill)?.label}的内容...`
              : '输入消息，Enter 发送，Shift+Enter 换行'
          }
          disabled={isLoading}
          rows={1}
          style={{
            flex: 1,
            resize: 'none',
            border: '1px solid #e5e7eb',
            borderRadius: 10,
            padding: '10px 14px',
            fontSize: 14,
            lineHeight: 1.5,
            outline: 'none',
            fontFamily: 'inherit',
            background: isLoading ? '#fafafa' : '#fff',
            transition: 'border-color 0.2s',
            overflow: 'hidden',
          }}
          onFocus={(e) => { e.currentTarget.style.borderColor = '#1677ff'; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = '#e5e7eb'; }}
        />

        {/* Character count */}
        {inputValue.length > 0 && (
          <span style={{ fontSize: 11, color: '#bbb', flexShrink: 0, alignSelf: 'center' }}>
            {inputValue.length}
          </span>
        )}

        {/* Send button */}
        <Button
          type="primary"
          icon={<SendOutlined />}
          onClick={handleSend}
          loading={isLoading}
          disabled={!inputValue.trim()}
          style={{
            borderRadius: 10,
            height: 42,
            width: 42,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        />
      </div>
    </div>
  );
};

export default ChatInput;
