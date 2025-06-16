import { Redis } from "@upstash/redis";

// Create a more robust Redis client with built-in error handling
let redisClient: Redis | null = null;

try {
  if (process.env.REDIS_URL && process.env.REDIS_TOKEN) {
    redisClient = new Redis({
      url: process.env.REDIS_URL,
      token: process.env.REDIS_TOKEN,
    });
  } else {
    console.warn("Redis credentials are missing. Redis functionality will be limited.");
  }
} catch (error) {
  console.error("Failed to initialize Redis client:", error);
}

// Export a wrapper with error handling
export const redis = {
  async get(key: string): Promise<any> {
    if (!redisClient) {
      console.warn("Redis client not initialized, returning null for get:", key);
      return null;
    }
    
    try {
      const data = await redisClient.get(key);
      if (data === null) return null;
      
      // Handle both string and object data
      if (typeof data === 'string') {
        try {
          return JSON.parse(data);
        } catch (e) {
          return data;
        }
      }
      return data;
    } catch (error) {
      console.error(`Redis get error for key ${key}:`, error);
      return null;
    }
  },
  
  async set(key: string, value: any): Promise<string | null> {
    if (!redisClient) {
      console.warn("Redis client not initialized, ignoring set operation:", key);
      return null;
    }
    
    try {
      // Serialize objects to JSON strings
      const serializedValue = typeof value === 'object' ? JSON.stringify(value) : value;
      return await redisClient.set(key, serializedValue);
    } catch (error) {
      console.error(`Redis set error for key ${key}:`, error);
      return null;
    }
  },

  async del(key: string): Promise<number | null> {
    if (!redisClient) {
      console.warn("Redis client not initialized, ignoring del operation:", key);
      return null;
    }
    
    try {
      return await redisClient.del(key);
    } catch (error) {
      console.error(`Redis del error for key ${key}:`, error);
      return null;
    }
  },
  
  // Add other Redis methods as needed with similar error handling
};
