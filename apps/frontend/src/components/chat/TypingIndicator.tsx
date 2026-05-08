import React from 'react';

const TypingIndicator: React.FC = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#fff', fontSize: 14, flexShrink: 0,
      }}>
        AI
      </div>
      <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 8, height: 8, borderRadius: '50%',
              background: '#1677ff',
              animation: `typingBounce 1.2s ${i * 0.2}s infinite ease-in-out`,
            }}
          />
        ))}
      </div>
      <style>{`
        @keyframes typingBounce {
          0%, 60%, 100% { opacity: 0.3; transform: translateY(0); }
          30% { opacity: 1; transform: translateY(-4px); }
        }
      `}</style>
    </div>
  );
};

export default TypingIndicator;
