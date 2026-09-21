const redisClient = require("../config/redis");

const CACHE_TTL = 60 * 60;

const redisService = {
  async get(key) {
    try {
      const data = await redisClient.get(key);
      return data ? JSON.parse(data) : null;
    } catch (err) {
      console.error("Redis GET error:", err);
      return null;
    }
  },

  async set(key, value, ttl = CACHE_TTL) {
    try {
      await redisClient.setEx(key, ttl, JSON.stringify(value));
    } catch (err) {
      console.error("Redis SET error:", err);
    }
  },

  async del(key) {
    try {
      await redisClient.del(key);
    } catch (err) {
      console.error("Redis DEL error:", err);
    }
  },
};

module.exports = redisService;
