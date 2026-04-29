/**
 * Redis utility — production'da ioredis, development'da xotiradagi Map.
 * REDIS_URL env o'rnatilmasa avtomatik fallback ishlaydi.
 */
const logger = require('./logger');

let redisClient = null;
const memoryStore = new Map();

/**
 * Redis yoki memory store'ga ulaning
 */
const connectRedis = async () => {
  const redisUrl = process.env.REDIS_URL;

  if (!redisUrl) {
    logger.warn('⚠️  REDIS_URL topilmadi — bot state\'lari xotirada saqlanadi (development rejimi)');
    return null;
  }

  try {
    const Redis = require('ioredis');
    redisClient = new Redis(redisUrl, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      retryStrategy(times) {
        if (times > 3) return null;
        return Math.min(times * 200, 2000);
      }
    });

    redisClient.on('connect', () => {
      logger.info('✅ Redis ulandi');
    });

    redisClient.on('error', (err) => {
      logger.error('Redis xatosi:', err.message);
    });

    await redisClient.connect();
    return redisClient;
  } catch (err) {
    logger.error('Redis ulanmadi, xotiradan foydalaniladi:', err.message);
    redisClient = null;
    return null;
  }
};

/**
 * Qiymat saqlash
 * @param {string} key
 * @param {any} value  — avtomatik JSON.stringify qilinadi
 * @param {number} [ttlSeconds] — isteğe bağlı TTL (soniya)
 */
const set = async (key, value, ttlSeconds = null) => {
  const serialized = JSON.stringify(value);

  if (redisClient) {
    if (ttlSeconds) {
      await redisClient.set(key, serialized, 'EX', ttlSeconds);
    } else {
      await redisClient.set(key, serialized);
    }
  } else {
    memoryStore.set(key, { value: serialized, expiresAt: ttlSeconds ? Date.now() + ttlSeconds * 1000 : null });
  }
};

/**
 * Qiymat olish
 * @param {string} key
 * @returns {any|null}
 */
const get = async (key) => {
  if (redisClient) {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  }

  const entry = memoryStore.get(key);
  if (!entry) return null;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return null;
  }
  return JSON.parse(entry.value);
};

/**
 * Qiymat o'chirish
 * @param {string} key
 */
const del = async (key) => {
  if (redisClient) {
    await redisClient.del(key);
  } else {
    memoryStore.delete(key);
  }
};

/**
 * Kalit mavjudligini tekshirish
 * @param {string} key
 * @returns {boolean}
 */
const exists = async (key) => {
  if (redisClient) {
    return (await redisClient.exists(key)) === 1;
  }
  const entry = memoryStore.get(key);
  if (!entry) return false;
  if (entry.expiresAt && Date.now() > entry.expiresAt) {
    memoryStore.delete(key);
    return false;
  }
  return true;
};

/**
 * Prefix bo'yicha barcha kalitlarni o'chirish
 * @param {string} prefix
 */
const deleteByPrefix = async (prefix) => {
  if (redisClient) {
    const keys = await redisClient.keys(`${prefix}*`);
    if (keys.length > 0) await redisClient.del(...keys);
  } else {
    for (const key of memoryStore.keys()) {
      if (key.startsWith(prefix)) memoryStore.delete(key);
    }
  }
};

/**
 * Redis ulanish holati
 */
const isConnected = () => {
  return redisClient && redisClient.status === 'ready';
};

module.exports = {
  connectRedis,
  set,
  get,
  del,
  exists,
  deleteByPrefix,
  isConnected,
  getClient: () => redisClient,
  _memoryStore: memoryStore // faqat test uchun
};
