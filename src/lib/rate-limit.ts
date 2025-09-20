import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'

// Initialize Redis client only if environment variables are available
let redis: Redis | null = null
if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
} else if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
  // Fallback to Upstash's default variable names
  redis = new Redis({
    url: process.env.KV_REST_API_URL,
    token: process.env.KV_REST_API_TOKEN,
  })
}

// Rate limiters for different endpoints (only if Redis is available)
export const rateLimiters = redis ? {
  // General API rate limiting
  general: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(100, '1 m'), // 100 requests per minute
    analytics: true,
    prefix: 'ratelimit:general',
  }),

  // Search rate limiting (more restrictive)
  search: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(50, '1 m'), // 50 searches per minute
    analytics: true,
    prefix: 'ratelimit:search',
  }),

  // Stock info rate limiting
  stockInfo: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(30, '1 m'), // 30 requests per minute
    analytics: true,
    prefix: 'ratelimit:stock-info',
  }),

  // Download rate limiting (very restrictive)
  download: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(10, '1 h'), // 10 downloads per hour
    analytics: true,
    prefix: 'ratelimit:download',
  }),

  // Authentication rate limiting
  auth: new Ratelimit({
    redis: redis,
    limiter: Ratelimit.slidingWindow(5, '1 m'), // 5 auth attempts per minute
    analytics: true,
    prefix: 'ratelimit:auth',
  }),
} : null

// Rate limiting middleware
export async function checkRateLimit(
  identifier: string,
  type: keyof NonNullable<typeof rateLimiters>
) {
  // If Redis is not available, allow all requests
  if (!rateLimiters) {
    return {
      success: true,
      limit: 1000,
      reset: Date.now() + 60000,
      remaining: 999,
      headers: {
        'X-RateLimit-Limit': '1000',
        'X-RateLimit-Remaining': '999',
        'X-RateLimit-Reset': new Date(Date.now() + 60000).toISOString(),
      }
    }
  }

  const { success, limit, reset, remaining } = await rateLimiters[type].limit(identifier)
  
  return {
    success,
    limit,
    reset,
    remaining,
    headers: {
      'X-RateLimit-Limit': limit.toString(),
      'X-RateLimit-Remaining': remaining.toString(),
      'X-RateLimit-Reset': new Date(reset).toISOString(),
    }
  }
}

// Get client identifier from request
export function getClientIdentifier(request: Request): string {
  // Try to get user ID from auth header first
  const authHeader = request.headers.get('authorization')
  if (authHeader) {
    try {
      const token = authHeader.split(' ')[1]
      // In a real implementation, you'd decode the JWT to get user ID
      // For now, we'll use the token as identifier
      return `user:${token}`
    } catch {
      // Fall back to IP if token is invalid
    }
  }

  // Fall back to IP address
  const forwarded = request.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0] : 'unknown'
  return `ip:${ip}`
}

// Specific rate limit functions for different endpoints
export async function checkRegistrationRateLimit(identifier: string) {
  return checkRateLimit(identifier, 'auth')
}

export async function checkEmailVerificationRateLimit(identifier: string) {
  return checkRateLimit(identifier, 'auth')
}

export async function checkPasswordResetRateLimit(identifier: string) {
  return checkRateLimit(identifier, 'auth')
}

export async function checkLoginRateLimit(identifier: string) {
  return checkRateLimit(identifier, 'auth')
}