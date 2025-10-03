interface RateLimitStore {
  [key: string]: {
    count: number
    resetTime: number
  }
}

const store: RateLimitStore = {}

export async function rateLimit(
  request: Request,
  identifier: string,
  limit: number,
  windowMs: number
): Promise<boolean> {
  // Create a unique key based on IP and identifier
  const ip = request.headers.get('x-forwarded-for') || 
             request.headers.get('x-real-ip') || 
             'unknown'
  const key = `${identifier}:${ip}`
  
  const now = Date.now()
  const windowStart = now - windowMs * 1000
  
  // Clean up old entries
  Object.keys(store).forEach(k => {
    if (store[k].resetTime < windowStart) {
      delete store[k]
    }
  })
  
  // Get or create entry
  if (!store[key]) {
    store[key] = {
      count: 0,
      resetTime: now + windowMs * 1000
    }
  }
  
  // Check rate limit
  if (store[key].count >= limit) {
    return false
  }
  
  // Increment counter
  store[key].count++
  
  return true
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

// Rate limiting middleware
export async function checkRateLimit(
  identifier: string,
  type: 'general' | 'search' | 'stockInfo' | 'download' | 'auth'
) {
  // Simplified rate limiting - always allow for now
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