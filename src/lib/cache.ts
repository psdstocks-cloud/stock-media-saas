import { Redis } from '@upstash/redis'

// Initialize Redis client
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

// Cache configuration
const CACHE_TTL = {
  STOCK_INFO: 60 * 60, // 1 hour
  SEARCH_RESULTS: 5 * 60, // 5 minutes
  SEARCH_SUGGESTIONS: 30 * 60, // 30 minutes
  USER_SESSION: 24 * 60 * 60, // 24 hours
  MEDIA_METADATA: 2 * 60 * 60, // 2 hours
} as const

// Cache key generators
export const cacheKeys = {
  stockInfo: (url: string) => `stock-info:${Buffer.from(url).toString('base64')}`,
  searchResults: (query: string, filters: any) => 
    `search:${Buffer.from(JSON.stringify({ query, filters })).toString('base64')}`,
  searchSuggestions: (query: string) => `suggestions:${Buffer.from(query).toString('base64')}`,
  userSession: (userId: string) => `user-session:${userId}`,
  mediaMetadata: (mediaId: string) => `media-metadata:${mediaId}`,
} as const

// Generic cache operations
export class CacheService {
  // Get cached data
  static async get<T>(key: string): Promise<T | null> {
    try {
      const data = await redis.get(key)
      return data as T | null
    } catch (error) {
      console.error('Cache get error:', error)
      return null
    }
  }

  // Set cached data with TTL
  static async set<T>(key: string, data: T, ttl: number): Promise<boolean> {
    try {
      await redis.setex(key, ttl, JSON.stringify(data))
      return true
    } catch (error) {
      console.error('Cache set error:', error)
      return false
    }
  }

  // Delete cached data
  static async delete(key: string): Promise<boolean> {
    try {
      await redis.del(key)
      return true
    } catch (error) {
      console.error('Cache delete error:', error)
      return false
    }
  }

  // Check if key exists
  static async exists(key: string): Promise<boolean> {
    try {
      const result = await redis.exists(key)
      return result === 1
    } catch (error) {
      console.error('Cache exists error:', error)
      return false
    }
  }

  // Get multiple keys
  static async mget<T>(keys: string[]): Promise<(T | null)[]> {
    try {
      const results = await redis.mget(...keys)
      return results.map(result => result ? JSON.parse(result as string) : null)
    } catch (error) {
      console.error('Cache mget error:', error)
      return keys.map(() => null)
    }
  }

  // Set multiple keys
  static async mset<T>(data: Record<string, T>, ttl: number): Promise<boolean> {
    try {
      const pipeline = redis.pipeline()
      for (const [key, value] of Object.entries(data)) {
        pipeline.setex(key, ttl, JSON.stringify(value))
      }
      await pipeline.exec()
      return true
    } catch (error) {
      console.error('Cache mset error:', error)
      return false
    }
  }

  // Increment counter
  static async incr(key: string, ttl?: number): Promise<number> {
    try {
      const result = await redis.incr(key)
      if (ttl) {
        await redis.expire(key, ttl)
      }
      return result
    } catch (error) {
      console.error('Cache incr error:', error)
      return 0
    }
  }

  // Set expiration
  static async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await redis.expire(key, ttl)
      return true
    } catch (error) {
      console.error('Cache expire error:', error)
      return false
    }
  }
}

// Specific cache operations for our use cases
export class StockMediaCache {
  // Cache stock info
  static async getStockInfo(url: string) {
    const key = cacheKeys.stockInfo(url)
    return await CacheService.get(key)
  }

  static async setStockInfo(url: string, data: any) {
    const key = cacheKeys.stockInfo(url)
    return await CacheService.set(key, data, CACHE_TTL.STOCK_INFO)
  }

  // Cache search results
  static async getSearchResults(query: string, filters: any) {
    const key = cacheKeys.searchResults(query, filters)
    return await CacheService.get(key)
  }

  static async setSearchResults(query: string, filters: any, data: any) {
    const key = cacheKeys.searchResults(query, filters)
    return await CacheService.set(key, data, CACHE_TTL.SEARCH_RESULTS)
  }

  // Cache search suggestions
  static async getSearchSuggestions(query: string) {
    const key = cacheKeys.searchSuggestions(query)
    return await CacheService.get(key)
  }

  static async setSearchSuggestions(query: string, data: any) {
    const key = cacheKeys.searchSuggestions(query)
    return await CacheService.set(key, data, CACHE_TTL.SEARCH_SUGGESTIONS)
  }

  // Cache user session
  static async getUserSession(userId: string) {
    const key = cacheKeys.userSession(userId)
    return await CacheService.get(key)
  }

  static async setUserSession(userId: string, data: any) {
    const key = cacheKeys.userSession(userId)
    return await CacheService.set(key, data, CACHE_TTL.USER_SESSION)
  }

  // Cache media metadata
  static async getMediaMetadata(mediaId: string) {
    const key = cacheKeys.mediaMetadata(mediaId)
    return await CacheService.get(key)
  }

  static async setMediaMetadata(mediaId: string, data: any) {
    const key = cacheKeys.mediaMetadata(mediaId)
    return await CacheService.set(key, data, CACHE_TTL.MEDIA_METADATA)
  }

  // Invalidate cache patterns
  static async invalidateUserCache(userId: string) {
    const patterns = [
      `user-session:${userId}`,
      `user-*:${userId}`,
    ]
    
    for (const pattern of patterns) {
      try {
        const keys = await redis.keys(pattern)
        if (keys.length > 0) {
          await redis.del(...keys)
        }
      } catch (error) {
        console.error('Cache invalidation error:', error)
      }
    }
  }

  static async invalidateSearchCache() {
    try {
      const keys = await redis.keys('search:*')
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Search cache invalidation error:', error)
    }
  }
}

// Cache middleware for API routes
export function withCache<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  keyGenerator: (...args: T) => string,
  ttl: number
) {
  return async (...args: T): Promise<R> => {
    const key = keyGenerator(...args)
    
    // Try to get from cache first
    const cached = await CacheService.get<R>(key)
    if (cached) {
      return cached
    }
    
    // Execute function and cache result
    const result = await fn(...args)
    await CacheService.set(key, result, ttl)
    
    return result
  }
}
