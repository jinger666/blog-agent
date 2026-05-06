// API types - shared request/response interfaces

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
}

// Auth types
export interface User {
  id: string;
  username: string;
  email: string;
  role: 'user' | 'admin';
  createdAt: Date;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  user: User;
  token: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

// Agent types
export interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: Date;
}

export interface ChatRequest {
  message: string;
  sessionId?: string;
  context?: Record<string, any>;
}

export interface ChatResponse {
  response: string;
  sessionId: string;
  usedTools?: string[];
  memoryUpdated?: boolean;
}

// Memory types
export interface Memory {
  id: string;
  userId: string;
  content: string;
  category: 'fact' | 'preference' | 'history';
  importance?: number;
  metadata?: Record<string, any>;
  createdAt: Date;
}

export interface MemorySearchRequest {
  query: string;
  userId: string;
  limit?: number;
  category?: string;
}

export interface SearchResult {
  memory: Memory;
  similarity: number;
}

// RAG types
export interface DocumentChunk {
  id: string;
  documentId: string;
  content: string;
  embedding?: number[];
  metadata?: Record<string, any>;
  chunkIndex: number;
}

export interface RAGQueryRequest {
  query: string;
  userId: string;
  topK?: number;
  filters?: Record<string, any>;
}

export interface RAGQueryResult {
  chunks: DocumentChunk[];
  answer?: string;
  sources?: string[];
}
