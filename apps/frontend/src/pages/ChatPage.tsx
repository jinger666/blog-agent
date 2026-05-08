import React, { useEffect, useRef } from 'react';
import { App } from 'antd';
import { v4 as uuidv4 } from 'uuid';
import { useChatStore } from '../stores/chatStore';
import { useAuthStore } from '../stores/authStore';
import apiClient from '../api/client';
import ChatMessage from '../components/chat/ChatMessage';
import ChatInput from '../components/chat/ChatInput';
import SessionList from '../components/chat/SessionList';
import TypingIndicator from '../components/chat/TypingIndicator';
import type { Message, Session } from '../stores/chatStore';

const SUGGESTED_PROMPTS = [
  { label: '生成博客标题', text: '请帮我生成5个关于人工智能发展趋势的博客标题' },
  { label: '创建内容大纲', text: '帮我创建一个关于"大语言模型入门指南"的博客大纲' },
  { label: 'SEO优化建议', text: '请分析我的博客文章并提供SEO优化建议' },
  { label: '文本摘要', text: '帮我总结以下文章的核心要点' },
];

const ChatPage: React.FC = () => {
  const {
    currentSessionId, sessions, messages, isLoading, sessionsLoading,
    setSessionId, clearSession, addMessage, setMessages, setLoading, setSessions, setSessionsLoading,
  } = useChatStore();
  const { user } = useAuthStore();
  const { message: antMsg } = App.useApp();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const userId = user?.id || 'anonymous';

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Load sessions on mount
  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    setSessionsLoading(true);
    try {
      const res = await apiClient.get('/agent/sessions', { params: { userId, limit: 50 } });
      const data = res.data?.data || res.data || [];
      const mapped: Session[] = (Array.isArray(data) ? data : []).map((s: any) => ({
        id: s.id || s.sessionId,
        title: s.title || '对话',
        lastMessage: s.lastMessage || '',
        updatedAt: s.updatedAt || s.createdAt || new Date().toISOString(),
        messageCount: s.messageCount || 0,
      }));
      setSessions(mapped);
    } catch {
      // sessions not critical, silently fail
    } finally {
      setSessionsLoading(false);
    }
  };

  const loadSessionHistory = async (sessionId: string) => {
    try {
      const res = await apiClient.get(`/agent/sessions/${sessionId}`);
      const data = res.data?.data || res.data;
      const history = data?.messages || data?.history || [];
      const msgs: Message[] = history.map((m: any) => ({
        id: m.id || uuidv4(),
        role: m.role,
        content: m.content,
        timestamp: new Date(m.timestamp || Date.now()),
      }));
      setMessages(msgs);
    } catch {
      setMessages([]);
    }
  };

  const handleSelectSession = (sessionId: string) => {
    setSessionId(sessionId);
    loadSessionHistory(sessionId);
  };

  const handleNewChat = () => {
    clearSession();
  };

  const handleSend = async (input: string, skill?: string) => {
    const actualMessage = skill
      ? `[技能: ${skill}] ${input}`
      : input;

    const userMessage: Message = {
      id: uuidv4(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    addMessage(userMessage);
    setLoading(true);

    try {
      const sessionId = currentSessionId || uuidv4();
      if (!currentSessionId) {
        setSessionId(sessionId);
      }

      const res = await apiClient.post('/agent/chat', {
        message: actualMessage,
        sessionId,
        userId,
      });

      // Backend returns { success, data: { response, sessionId, usedTools, memoryUpdated } }
      const body = res.data?.data || res.data;
      const responseText = body.response || body.output || '';

      const assistantMessage: Message = {
        id: uuidv4(),
        role: 'assistant',
        content: responseText,
        timestamp: new Date(),
      };

      addMessage(assistantMessage);

      // Refresh session list
      loadSessions();
    } catch (error: any) {
      const errMsg = error.response?.data?.error || error.response?.data?.message || '发送消息失败，请检查后端服务是否运行';
      antMsg.error(errMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 140px)', gap: 0 }}>
      {/* Session sidebar */}
      <div style={{
        width: 200, flexShrink: 0,
        borderRight: '1px solid #f0f0f0',
        background: '#fafafa',
        borderRadius: '8px 0 0 8px',
        overflow: 'hidden',
      }}>
        <SessionList
          sessions={sessions}
          activeSessionId={currentSessionId}
          loading={sessionsLoading}
          onSelect={handleSelectSession}
          onNew={handleNewChat}
        />
      </div>

      {/* Main chat area */}
      <div style={{
        flex: 1, display: 'flex', flexDirection: 'column',
        background: '#f8f9fb',
        borderRadius: '0 8px 8px 0',
        overflow: 'hidden',
      }}>
        {/* Messages */}
        <div
          ref={containerRef}
          style={{
            flex: 1, overflowY: 'auto',
            padding: '20px 24px',
          }}
        >
          {messages.length === 0 && !isLoading ? (
            /* Welcome state */
            <div style={{
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', justifyContent: 'center',
              height: '100%', padding: '0 40px',
            }}>
              <div style={{
                width: 72, height: 72, borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 32, marginBottom: 20,
                boxShadow: '0 4px 20px rgba(102,126,234,0.3)',
              }}>
                🤖
              </div>
              <h2 style={{ margin: '0 0 8px 0', fontSize: 22, fontWeight: 600, color: '#1f2937' }}>
                AI 博客助手
              </h2>
              <p style={{ margin: '0 0 32px 0', color: '#6b7280', fontSize: 14, textAlign: 'center' }}>
                由 DeepSeek 驱动 · 专业的 AI 博客创作与优化平台
              </p>

              <div style={{
                display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)',
                gap: 10, maxWidth: 520, width: '100%',
              }}>
                {SUGGESTED_PROMPTS.map((prompt) => (
                  <div
                    key={prompt.label}
                    onClick={() => handleSend(prompt.text)}
                    style={{
                      padding: '12px 16px',
                      borderRadius: 10,
                      border: '1px solid #e5e7eb',
                      background: '#fff',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      fontSize: 13,
                      color: '#374151',
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = '#1677ff';
                      e.currentTarget.style.boxShadow = '0 2px 8px rgba(22,119,255,0.1)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = '#e5e7eb';
                      e.currentTarget.style.boxShadow = 'none';
                    }}
                  >
                    <div style={{ fontWeight: 500, marginBottom: 2 }}>{prompt.label}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {prompt.text}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Message list */
            messages.map((msg) => (
              <ChatMessage
                key={msg.id}
                id={msg.id}
                role={msg.role}
                content={msg.content}
                timestamp={msg.timestamp}
              />
            ))
          )}

          {/* Typing indicator */}
          {isLoading && <TypingIndicator />}

          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <ChatInput onSend={handleSend} isLoading={isLoading} />
      </div>

      {/* Markdown content styles */}
      <style>{`
        .markdown-content h1, .markdown-content h2, .markdown-content h3 {
          margin-top: 16px; margin-bottom: 8px; font-weight: 600;
        }
        .markdown-content h1 { font-size: 1.4em; }
        .markdown-content h2 { font-size: 1.2em; }
        .markdown-content h3 { font-size: 1.05em; }
        .markdown-content p { margin: 8px 0; }
        .markdown-content ul, .markdown-content ol { padding-left: 20px; margin: 8px 0; }
        .markdown-content li { margin: 4px 0; }
        .markdown-content code {
          background: #f0f0f0; padding: 2px 6px; border-radius: 4px;
          font-size: 0.9em; font-family: 'SF Mono', 'Monaco', 'Menlo', monospace;
        }
        .markdown-content pre {
          background: #1e1e1e; color: #d4d4d4; padding: 16px; border-radius: 8px;
          overflow-x: auto; margin: 12px 0; font-size: 13px; line-height: 1.5;
        }
        .markdown-content pre code {
          background: transparent; padding: 0; color: inherit; font-size: inherit;
        }
        .markdown-content blockquote {
          border-left: 3px solid #1677ff; padding: 8px 16px; margin: 12px 0;
          background: #f0f5ff; border-radius: 0 8px 8px 0; color: #555;
        }
        .markdown-content table {
          border-collapse: collapse; width: 100%; margin: 12px 0;
        }
        .markdown-content th, .markdown-content td {
          border: 1px solid #e5e7eb; padding: 8px 12px; text-align: left;
        }
        .markdown-content th { background: #f9fafb; font-weight: 600; }
        .markdown-content a { color: #1677ff; text-decoration: none; }
        .markdown-content a:hover { text-decoration: underline; }
        .markdown-content strong { font-weight: 600; color: #1f2937; }
      `}</style>
    </div>
  );
};

export default ChatPage;
