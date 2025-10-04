interface RateLimitEntry {
  count: number
  resetTime: number
}

const rateLimitStore = new Map<string, RateLimitEntry>()

export async function rateLimit(
  request: Request,
  identifier: string,
  limit: number,
  windowSeconds: number
): Promise<boolean> {
  // Get client IP
  const ip = request.headers.get('x-forwarded-for') || 
           request.headers.get('x-real-ip') || 
           'unknown'
  
  const key = `${identifier}:${ip}`
  const now = Date.now()
  const windowMs = windowSeconds * 1000
  
  // Clean up expired entries
  for (const [k, entry] of rateLimitStore.entries()) {
    if (now > entry.resetTime) {
      rateLimitStore.delete(k)
    }
  }
  
  // Get or create entry
  let entry = rateLimitStore.get(key)
  if (!entry || now > entry.resetTime) {
    entry = {
      count: 0,
      resetTime: now + windowMs
    }
    rateLimitStore.set(key, entry)
  }
  
  // Check limit
  if (entry.count >= limit) {
    console.log(`🚫 Rate limit exceeded for ${key}: ${entry.count}/${limit}`)
    return false
  }
  
  // Increment counter
  entry.count++
  
  console.log(`✅ Rate limit OK for ${key}: ${entry.count}/${limit}`)
  return true
}

// Legacy function names for backward compatibility
export const checkEmailVerificationRateLimit = (request: Request) => 
  rateLimit(request, 'email_verification', 5, 300) // 5 attempts per 5 minutes

export const checkPasswordResetRateLimit = (request: Request) => 
  rateLimit(request, 'password_reset', 3, 900) // 3 attempts per 15 minutes

export const getClientIdentifier = (request: Request) => {
  return request.headers.get('x-forwarded-for') || 
         request.headers.get('x-real-ip') || 
         'unknown'
}

export const checkRateLimit = rateLimit