import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';
import { logger } from '../../utils/logger';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private configService: ConfigService) {
    const redisURL = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';
    this.client = createClient({ url: redisURL });
  }

  async onModuleInit() {
    this.client.on('error', (error) => {
      logger.error('Redis client error:', error);
    });

    this.client.on('connect', () => {
      logger.info('✅ Redis connected successfully');
    });

    await this.client.connect();
  }

  async onModuleDestroy() {
    await this.client.quit();
    logger.info('Redis disconnected gracefully');
  }

  getClient(): RedisClientType {
    return this.client;
  }

  // Helper methods
  async set(key: string, value: string, ttl?: number): Promise<void> {
    try {
      if (ttl) {
        await this.client.setEx(key, ttl, value);
      } else {
        await this.client.set(key, value);
      }
    } catch (error) {
      logger.error(`Error setting cache key ${key}:`, error);
    }
  }

  async get(key: string): Promise<string | null> {
    try {
      return await this.client.get(key);
    } catch (error) {
      logger.error(`Error getting cache key ${key}:`, error);
      return null;
    }
  }

  async del(key: string): Promise<void> {
    try {
      await this.client.del(key);
    } catch (error) {
      logger.error(`Error deleting cache key ${key}:`, error);
    }
  }
}
