// Test setup file
import mongoose from 'mongoose';

beforeAll(async () => {
  // Connect to test database
  const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Clean up
  await mongoose.connection.close();
});

beforeEach(async () => {
  // Clear collections before each test
  if (mongoose.connection.db) {
    const collections = await mongoose.connection.db.collections();
    for (const collection of collections) {
      await collection.deleteMany({});
    }
  }
});
