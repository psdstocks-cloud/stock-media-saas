import { Redis } from '@upstash/redis'

// Initialize Redis client for rate limiting
const redis = new Redis({
  url: process.env.UPSTASH_REDIS_REST_URL!,
  token: process.env.UPSTASH_REDIS_REST_TOKEN!,
})

export interface RateLimitOptions {
  windowMs: number // Time window in milliseconds
  max: number // Maximum number of requests per window
  message?: string // Custom error message
  skipSuccessfulRequests?: boolean // Don't count successful requests
  skipFailedRequests?: boolean // Don't count failed requests
}

export interface RateLimitResult {
  success: boolean
  remaining: number
  resetTime: number
  message?: string
}

export class RateLimiter {
  private options: Required<RateLimitOptions>

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options
    }
  }

  async checkLimit(identifier: string): Promise<RateLimitResult> {
    const key = `rate_limit:${identifier}`
    const window = Math.floor(Date.now() / this.options.windowMs)
    const windowKey = `${key}:${window}`
    
    try {
      // Get current count for this window
      const current = await redis.get<number>(windowKey) || 0
      
      if (current >= this.options.max) {
        // Rate limit exceeded
        const resetTime = (window + 1) * this.options.windowMs
        return {
          success: false,
          remaining: 0,
          resetTime,
          message: this.options.message
        }
      }
      
      // Increment counter
      const newCount = await redis.incr(windowKey)
      
      // Set expiration for the key (cleanup)
      if (newCount === 1) {
        await redis.expire(windowKey, Math.ceil(this.options.windowMs / 1000))
      }
      
      return {
        success: true,
        remaining: this.options.max - newCount,
        resetTime: (window + 1) * this.options.windowMs
      }
      
    } catch (error) {
      console.error('Rate limiter error:', error)
      // Fail open - allow request if Redis is down
      return {
        success: true,
        remaining: this.options.max - 1,
        resetTime: Date.now() + this.options.windowMs
      }
    }
  }

  async resetLimit(identifier: string): Promise<void> {
    const key = `rate_limit:${identifier}`
    const pattern = `${key}:*`
    
    try {
      // Get all keys matching the pattern
      const keys = await redis.keys(pattern)
      
      if (keys.length > 0) {
        await redis.del(...keys)
      }
    } catch (error) {
      console.error('Error resetting rate limit:', error)
    }
  }

  async getRemaining(identifier: string): Promise<number> {
    const key = `rate_limit:${identifier}`
    const window = Math.floor(Date.now() / this.options.windowMs)
    const windowKey = `${key}:${window}`
    
    try {
      const current = await redis.get<number>(windowKey) || 0
      return Math.max(0, this.options.max - current)
    } catch (error) {
      console.error('Error getting remaining limit:', error)
      return this.options.max
    }
  }

  async getResetTime(_identifier: string): Promise<number> {
    const window = Math.floor(Date.now() / this.options.windowMs)
    return (window + 1) * this.options.windowMs
  }
}

// Pre-configured rate limiters for different use cases
export const rateLimiters = {
  // General API calls
  general: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 100,
    message: 'Too many requests, please try again later'
  }),
  
  // Search requests
  search: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 50,
    message: 'Too many search requests, please try again later'
  }),
  
  // Order creation
  orders: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 10,
    message: 'Too many order requests, please try again later'
  }),
  
  // Points history
  pointsHistory: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 30,
    message: 'Too many requests for points history'
  }),
  
  // Authentication
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5,
    message: 'Too many authentication attempts, please try again later'
  }),
  
  // File uploads
  uploads: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: 'Too many file uploads, please try again later'
  })
}

// Utility function to get rate limit headers
export function getRateLimitHeaders(result: RateLimitResult): Record<string, string> {
  return {
    'X-RateLimit-Limit': '100',
    'X-RateLimit-Remaining': result.remaining.toString(),
    'X-RateLimit-Reset': new Date(result.resetTime).toISOString(),
    'Retry-After': result.success ? '0' : Math.ceil((result.resetTime - Date.now()) / 1000).toString()
  }
}
