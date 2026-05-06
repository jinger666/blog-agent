import request from 'supertest';
import app from '../index';

describe('Health Check', () => {
  it('should return health status', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('status', 'OK');
    expect(response.body).toHaveProperty('timestamp');
    expect(response.body).toHaveProperty('uptime');
  });
});

describe('Agent API', () => {
  it('should reject chat without message', async () => {
    const response = await request(app)
      .post('/api/agent/chat')
      .send({});
    
    expect(response.status).toBe(400);
    expect(response.body.error).toBeDefined();
  });

  it('should execute skill', async () => {
    const response = await request(app)
      .post('/api/agent/execute')
      .send({
        skill: 'text_analyzer',
        input: 'This is a test message for analysis',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('result');
  });
});

describe('Memory API', () => {
  it('should store memory', async () => {
    const response = await request(app)
      .post('/api/memory/store')
      .send({
        content: 'Test memory content',
        category: 'fact',
        userId: 'test-user',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('memory');
    expect(response.body.memory.content).toBe('Test memory content');
  });

  it('should search memories', async () => {
    const response = await request(app)
      .get('/api/memory/search?q=test&userId=test-user');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('memories');
    expect(response.body).toHaveProperty('count');
  });

  it('should get memory stats', async () => {
    const response = await request(app)
      .get('/api/memory/stats?userId=test-user');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('total');
    expect(response.body).toHaveProperty('byCategory');
  });
});

describe('RAG API', () => {
  it('should index document', async () => {
    const response = await request(app)
      .post('/api/rag/index')
      .send({
        content: 'This is test document content for indexing',
        type: 'txt',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('documentId');
    expect(response.body).toHaveProperty('chunkCount');
  });

  it('should query documents', async () => {
    const response = await request(app)
      .post('/api/rag/query')
      .send({
        query: 'test query',
        topK: 5,
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('answer');
    expect(response.body).toHaveProperty('sources');
  });

  it('should get RAG stats', async () => {
    const response = await request(app)
      .get('/api/rag/stats');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('totalDocuments');
    expect(response.body).toHaveProperty('totalChunks');
  });
});

describe('Workflow API', () => {
  it('should create workflow', async () => {
    const response = await request(app)
      .post('/api/workflows')
      .send({
        name: 'Test Workflow',
        description: 'Test description',
        nodes: [
          {
            id: 'start-1',
            type: 'start',
            position: { x: 100, y: 100 },
            data: {},
          },
        ],
        edges: [],
        userId: 'test-user',
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('workflow');
  });

  it('should list workflows', async () => {
    const response = await request(app)
      .get('/api/workflows?userId=test-user');
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('workflows');
  });
});

describe('Auth API', () => {
  it('should register user', async () => {
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(response.status).toBe(201);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should login user', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123',
      });
    
    expect(response.status).toBe(200);
    expect(response.body).toHaveProperty('token');
    expect(response.body).toHaveProperty('user');
  });

  it('should reject invalid login', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'wrong@example.com',
        password: 'wrongpassword',
      });
    
    expect(response.status).toBe(401);
  });
});
