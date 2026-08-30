const { logger } = require('./logger');

class CacheManager {
  constructor(ttl = 300000) {
    this.cache = new Map();
    this.ttl = ttl;
  }

  set(key, value, ttl = this.ttl) {
    if (this.cache.has(key)) {
      clearTimeout(this.cache.get(key).timeout);
    }

    const timeout = setTimeout(() => {
      this.cache.delete(key);
      logger.debug(`Cache expired for key: ${key}`);
    }, ttl);

    this.cache.set(key, { value, timeout, createdAt: Date.now() });
    logger.debug(`Cache set for key: ${key}`);
  }

  get(key) {
    const item = this.cache.get(key);
    if (!item) return undefined;
    return item.value;
  }

  has(key) {
    return this.cache.has(key);
  }

  delete(key) {
    const item = this.cache.get(key);
    if (item) {
      clearTimeout(item.timeout);
      this.cache.delete(key);
      logger.debug(`Cache deleted for key: ${key}`);
    }
  }

  clear() {
    for (const [, item] of this.cache) {
      clearTimeout(item.timeout);
    }
    this.cache.clear();
    logger.info('Cache cleared');
  }

  getStats() {
    return {
      size: this.cache.size,
      keys: Array.from(this.cache.keys()),
      ttl: this.ttl
    };
  }
}

module.exports = { CacheManager };