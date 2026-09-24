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

  /** Distributed lock for reserving a slot during payment */
  slotLock: (screenId: string, dateIso: string, slotTime: string) =>
    `lock:slot:${screenId}:${dateIso}:${slotTime}`,
} as const;

/**
 * Atomically acquires a distributed lock on a slot using Redis SET NX EX.
 * Returns true if the lock was acquired, false if the slot is already locked.
 */
export async function acquireSlotLock(
  screenId: string,
  dateIso: string,
  slotTime: string,
  bookingId: string,
  ttlSeconds = 600,
): Promise<boolean> {
  try {
    const client = getRedisClient();
    const key = RedisKeys.slotLock(screenId, dateIso, slotTime);
    const result = await client.set(key, bookingId, 'EX', ttlSeconds, 'NX');
    return result === 'OK';
  } catch (err) {
    console.error('[Redis] acquireSlotLock error:', err);
    // If Redis has an issue, allow booking to proceed to DB checks rather than crashing
    return true;
  }
}

/**
 * Releases a slot lock in Redis.
 */
export async function releaseSlotLock(
  screenId: string,
  dateIso: string,
  slotTime: string,
  bookingId?: string,
): Promise<void> {
  try {
    const client = getRedisClient();
    const key = RedisKeys.slotLock(screenId, dateIso, slotTime);
    if (bookingId) {
      const currentHolder = await client.get(key);
      if (currentHolder === bookingId) {
        await client.del(key);
      }
    } else {
      await client.del(key);
    }
  } catch (err) {
    console.error('[Redis] releaseSlotLock error:', err);
  }
}

/**
 * Invalidates the slot availability cache for a given screen and date.
 */
export async function invalidateSlotCache(
  screenId: string,
  dateIso: string,
): Promise<void> {
  try {
    const client = getRedisClient();
    await client.del(RedisKeys.slotCache(screenId, dateIso));
  } catch (err) {
    console.error('[Redis] invalidateSlotCache error:', err);
  }
}

export function getRedisStatus(): 'ready' | 'connecting' | 'disconnected' {
  if (!redisClient) return 'disconnected';
  const status = redisClient.status;
  if (status === 'ready') return 'ready';
  if (status === 'connecting' || status === 'reconnecting') return 'connecting';
  return 'disconnected';
}

