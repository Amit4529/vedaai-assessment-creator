import Redis from 'ioredis';
import { env } from './env';

const redisUrl = env.REDIS_URL;

const redisOptions: import('ioredis').RedisOptions = {
  maxRetriesPerRequest: null, // Required by BullMQ
  lazyConnect: true,          // Don't connect immediately — let us handle errors
  retryStrategy(times) {
    const delay = Math.min(times * 500, 5000);
    console.log(`🔄 Redis retry attempt ${times}, next in ${delay}ms`);
    return delay;
  },
};

export const redis = redisUrl
  ? new Redis(redisUrl, redisOptions)
  : new Redis({
      ...redisOptions,
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      password: env.REDIS_PASSWORD || undefined,
      tls: env.REDIS_TLS === 'true' ? {} : undefined,
    });

let redisReady = false;

redis.on('connect', () => {
  console.log('✅ Redis connected successfully');
});

redis.on('ready', () => {
  redisReady = true;
  console.log('✅ Redis ready');
});

redis.on('end', () => {
  redisReady = false;
});

redis.on('error', (err) => {
  redisReady = false;
  console.error('❌ Redis connection error:', err.message);
});

// Attempt to connect, but don't crash if it fails
redis.connect().catch((err) => {
  console.warn('⚠️ Redis initial connection failed (non-fatal):', err.message);
});

export function isRedisReady(): boolean {
  return redisReady;
}

// Cache helpers
const CACHE_TTL = 3600; // 1 hour

export async function getCache(key: string): Promise<string | null> {
  try {
    if (!redisReady) return null;
    return await redis.get(key);
  } catch {
    return null;
  }
}

export async function setCache(key: string, value: string, ttl: number = CACHE_TTL): Promise<void> {
  try {
    if (!redisReady) return;
    await redis.set(key, value, 'EX', ttl);
  } catch (err) {
    console.error('Cache set error:', err);
  }
}

export async function deleteCache(key: string): Promise<void> {
  try {
    if (!redisReady) return;
    await redis.del(key);
  } catch (err) {
    console.error('Cache delete error:', err);
  }
}
