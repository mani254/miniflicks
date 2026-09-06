import Redis from 'ioredis';
import { config } from './env';

let redisClient: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisClient) {
    throw new Error('[Redis] Client not initialized. Call connectRedis() first.');
  }
  return redisClient;
}

export async function connectRedis(): Promise<void> {
  const client = new Redis(config.redis.url, {
    lazyConnect: true,
    maxRetriesPerRequest: 3,
    retryStrategy: (times: number) => {
      if (times > 5) {
        console.error('[Redis] Max retries exceeded. Redis connection failed.');
        return null; // Stop retrying
      }
      return Math.min(times * 200, 2000);
    },
    keyPrefix: config.redis.keyPrefix,
  });

  client.on('error', (err: Error) => {
    console.error('[Redis] Error:', err.message);
  });

  client.on('connect', () => {
    console.log('[Redis] Connected successfully');
  });

  client.on('reconnecting', () => {
    console.warn('[Redis] Reconnecting...');
  });

  await client.connect();
  redisClient = client;
}

export async function disconnectRedis(): Promise<void> {
  if (!redisClient) return;
  await redisClient.quit();
  redisClient = null;
  console.log('[Redis] Disconnected gracefully');
}

/**
 * Typed Redis key builders — ensures consistent key naming across the app.
 */
export const RedisKeys = {
  /** Active pending booking session state */
  bookingSession: (bookingId: string) => `session:${bookingId}`,

  /** Cached booked slots for a screen on a specific date */
  slotCache: (screenId: string, dateIso: string) => `slots:${screenId}:${dateIso}`,
} as const;

export function getRedisStatus(): 'ready' | 'connecting' | 'disconnected' {
  if (!redisClient) return 'disconnected';
  const status = redisClient.status;
  if (status === 'ready') return 'ready';
  if (status === 'connecting' || status === 'reconnecting') return 'connecting';
  return 'disconnected';
}
