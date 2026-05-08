import { create } from 'zustand';

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
}

interface Session {
  id: string;
  title: string;
  lastMessage?: string;
  updatedAt: string;
  messageCount: number;
}

interface ChatState {
  currentSessionId: string | null;
  sessions: Session[];
  messages: Message[];
  isLoading: boolean;
  sessionsLoading: boolean;
  setSessionId: (id: string) => void;
  clearSession: () => void;
  addMessage: (message: Message) => void;
  setMessages: (messages: Message[]) => void;
  setLoading: (loading: boolean) => void;
  setSessions: (sessions: Session[]) => void;
  setSessionsLoading: (loading: boolean) => void;
  clearChat: () => void;
}

export const useChatStore = create<ChatState>((set) => ({
  currentSessionId: null,
  sessions: [],
  messages: [],
  isLoading: false,
  sessionsLoading: false,

  setSessionId: (id) => set({ currentSessionId: id }),

  clearSession: () => set({ currentSessionId: null, messages: [] }),

  addMessage: (message) => set((state) => ({
    messages: [...state.messages, message],
  })),

  setMessages: (messages) => set({ messages }),

  setLoading: (loading) => set({ isLoading: loading }),

  setSessions: (sessions) => set({ sessions }),

  setSessionsLoading: (loading) => set({ sessionsLoading: loading }),

  clearChat: () => set({ messages: [], currentSessionId: null }),
}));

export type { Message, Session };
