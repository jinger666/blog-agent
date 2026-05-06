// MongoDB initialization script
db = db.getSiblingDB('ai_blog');

// Create collections with indexes
db.createCollection('sessions');
db.createCollection('memories');
db.createCollection('workflows');
db.createCollection('documents');
db.createCollection('users');

// Create indexes for memories collection
db.memories.createIndex({ userId: 1 });
db.memories.createIndex({ category: 1 });
db.memories.createIndex({ importance: -1 });
db.memories.createIndex({ createdAt: -1 });
db.memories.createIndex({ accessedAt: -1 });

// Create vector index for semantic search (requires Atlas or manual setup)
// For local MongoDB, we'll use application-level similarity search

// Create indexes for sessions
db.sessions.createIndex({ userId: 1 });
db.sessions.createIndex({ lastActiveAt: -1 });

// Create indexes for workflows
db.workflows.createIndex({ userId: 1 });
db.workflows.createIndex({ createdAt: -1 });

// Create default admin user (password should be changed)
db.users.insertOne({
  username: 'admin',
  email: 'admin@example.com',
  passwordHash: '$2b$10$example_hash_change_in_production',
  role: 'admin',
  createdAt: new Date(),
  updatedAt: new Date()
});

print('Database initialized successfully');
