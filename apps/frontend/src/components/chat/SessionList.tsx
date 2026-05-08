import React from 'react';
import { Button } from 'antd';
import { PlusOutlined, MessageOutlined } from '@ant-design/icons';
import dayjs from 'dayjs';

interface Session {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  messageCount: number;
}

interface SessionListProps {
  sessions: Session[];
  activeSessionId: string | null;
  loading: boolean;
  onSelect: (sessionId: string) => void;
  onNew: () => void;
}

const SessionList: React.FC<SessionListProps> = ({
  sessions,
  activeSessionId,
  loading,
  onSelect,
  onNew,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      <div style={{ padding: '12px 16px', borderBottom: '1px solid #f0f0f0' }}>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={onNew}
          block
          style={{ borderRadius: 8, height: 40, fontWeight: 500 }}
        >
          新对话
        </Button>
      </div>

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>加载中...</div>
        ) : sessions.length === 0 ? (
          <div style={{ padding: 24, textAlign: 'center', color: '#999' }}>
            <MessageOutlined style={{ fontSize: 28, marginBottom: 8, opacity: 0.3 }} />
            <p style={{ fontSize: 13, margin: 0 }}>暂无对话记录</p>
          </div>
        ) : (
          sessions.map((session) => (
            <div
              key={session.id}
              onClick={() => onSelect(session.id)}
              style={{
                padding: '12px 16px',
                cursor: 'pointer',
                borderLeft: session.id === activeSessionId ? '3px solid #1677ff' : '3px solid transparent',
                background: session.id === activeSessionId ? '#e6f4ff' : 'transparent',
                borderBottom: '1px solid #fafafa',
                transition: 'all 0.2s',
              }}
              onMouseEnter={(e) => {
                if (session.id !== activeSessionId) {
                  e.currentTarget.style.background = '#fafafa';
                }
              }}
              onMouseLeave={(e) => {
                if (session.id !== activeSessionId) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{
                  fontWeight: session.id === activeSessionId ? 600 : 400,
                  fontSize: 14, color: '#1f2937',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  flex: 1, marginRight: 8,
                }}>
                  {session.title || '新对话'}
                </div>
              </div>
              <div style={{
                fontSize: 12, color: '#999', marginTop: 4,
                overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
              }}>
                {session.lastMessage || '暂无消息'}
              </div>
              <div style={{ fontSize: 11, color: '#bbb', marginTop: 2 }}>
                {dayjs(session.updatedAt).format('MM-DD HH:mm')}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default SessionList;
