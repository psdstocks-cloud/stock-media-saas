import { LRUCache } from 'lru-cache'

// Rate limiting for registration attempts
const registrationRateLimit = new LRUCache<string, { count: number; resetTime: number }>({
  max: 1000,
  ttl: 15 * 60 * 1000, // 15 minutes
})

// Rate limiting for email verification attempts
const emailVerificationRateLimit = new LRUCache<string, { count: number; resetTime: number }>({
  max: 1000,
  ttl: 5 * 60 * 1000, // 5 minutes
})

// Rate limiting for password reset attempts
const passwordResetRateLimit = new LRUCache<string, { count: number; resetTime: number }>({
  max: 1000,
  ttl: 15 * 60 * 1000, // 15 minutes
})

export const checkRegistrationRateLimit = (ip: string) => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 5 // Maximum 5 registration attempts per IP per 15 minutes

  const key = `reg_${ip}`
  const current = registrationRateLimit.get(key)

  if (!current) {
    registrationRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (now > current.resetTime) {
    registrationRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (current.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    }
  }

  current.count++
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  }
}

export const checkEmailVerificationRateLimit = (email: string) => {
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  const maxAttempts = 3 // Maximum 3 email verification attempts per email per 5 minutes

  const key = `email_${email.toLowerCase()}`
  const current = emailVerificationRateLimit.get(key)

  if (!current) {
    emailVerificationRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (now > current.resetTime) {
    emailVerificationRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (current.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    }
  }

  current.count++
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  }
}

export const checkPasswordResetRateLimit = (ip: string) => {
  const now = Date.now()
  const windowMs = 15 * 60 * 1000 // 15 minutes
  const maxAttempts = 3 // Maximum 3 password reset attempts per IP per 15 minutes

  const key = `reset_${ip}`
  const current = passwordResetRateLimit.get(key)

  if (!current) {
    passwordResetRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (now > current.resetTime) {
    passwordResetRateLimit.set(key, { count: 1, resetTime: now + windowMs })
    return { allowed: true, remaining: maxAttempts - 1, resetTime: now + windowMs }
  }

  if (current.count >= maxAttempts) {
    return { 
      allowed: false, 
      remaining: 0, 
      resetTime: current.resetTime,
      retryAfter: Math.ceil((current.resetTime - now) / 1000)
    }
  }

  current.count++
  return { 
    allowed: true, 
    remaining: maxAttempts - current.count, 
    resetTime: current.resetTime 
  }
}

// Generic rate limiting function
export const checkRateLimit = (config: { interval: number; uniqueTokenPerInterval: number }) => {
  const rateLimit = new LRUCache<string, { count: number; resetTime: number }>({
    max: 1000,
    ttl: config.interval,
  })

  return {
    checkLimit: (ip: string) => {
      const now = Date.now()
      const key = `generic_${ip}`
      const current = rateLimit.get(key)

      if (!current) {
        rateLimit.set(key, { count: 1, resetTime: now + config.interval })
        return { success: true, remaining: config.uniqueTokenPerInterval - 1, resetTime: now + config.interval }
      }

      if (now > current.resetTime) {
        rateLimit.set(key, { count: 1, resetTime: now + config.interval })
        return { success: true, remaining: config.uniqueTokenPerInterval - 1, resetTime: now + config.interval }
      }

      if (current.count >= config.uniqueTokenPerInterval) {
        return { 
          success: false, 
          remaining: 0, 
          resetTime: current.resetTime,
          retryAfter: Math.ceil((current.resetTime - now) / 1000)
        }
      }

      current.count++
      return { 
        success: true, 
        remaining: config.uniqueTokenPerInterval - current.count, 
        resetTime: current.resetTime 
      }
    }
  }
}

// Clean up expired entries periodically
setInterval(() => {
  const now = Date.now()
  for (const [key, value] of registrationRateLimit.entries()) {
    if (now > value.resetTime) {
      registrationRateLimit.delete(key)
    }
  }
  for (const [key, value] of emailVerificationRateLimit.entries()) {
    if (now > value.resetTime) {
      emailVerificationRateLimit.delete(key)
    }
  }
  for (const [key, value] of passwordResetRateLimit.entries()) {
    if (now > value.resetTime) {
      passwordResetRateLimit.delete(key)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes