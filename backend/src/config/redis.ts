import { createClient, RedisClientType } from 'redis';
import { logger } from '../utils/logger';

let redisClient: RedisClientType | null = null;

export const connectRedis = async (): Promise<void> => {
  try {
    const redisURL = process.env.REDIS_URL || 'redis://localhost:6379';
    
    redisClient = createClient({ url: redisURL });
    
    redisClient.on('error', (error) => {
      logger.error('Redis client error:', error);
    });
    
    redisClient.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });
    
    await redisClient.connect();
    
  } catch (error) {
    logger.error('Failed to connect to Redis:', error);
    throw error;
  }
};

export const getRedisClient = (): RedisClientType | null => {
  return redisClient;
};

export const disconnectRedis = async (): Promise<void> => {
  try {
    if (redisClient) {
      await redisClient.quit();
      logger.info('Redis disconnected gracefully');
    }
  } catch (error) {
    logger.error('Error disconnecting from Redis:', error);
  }
};

// Helper functions for common Redis operations
export const cacheSet = async (key: string, value: string, ttl?: number): Promise<void> => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return;
  }
  
  try {
    if (ttl) {
      await redisClient.setEx(key, ttl, value);
    } else {
      await redisClient.set(key, value);
    }
  } catch (error) {
    logger.error(`Error setting cache key ${key}:`, error);
  }
};

export const cacheGet = async (key: string): Promise<string | null> => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return null;
  }
  
  try {
    return await redisClient.get(key);
  } catch (error) {
    logger.error(`Error getting cache key ${key}:`, error);
    return null;
  }
};

export const cacheDelete = async (key: string): Promise<void> => {
  if (!redisClient) {
    logger.warn('Redis client not initialized');
    return;
  }
  
  try {
    await redisClient.del(key);
  } catch (error) {
    logger.error(`Error deleting cache key ${key}:`, error);
  }
};
