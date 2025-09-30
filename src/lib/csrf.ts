import crypto from 'crypto'

// CSRF token storage (in production, use Redis or database)
const csrfTokens = new Map<string, { token: string; expires: number }>()

// Generate a new CSRF token
export function generateCSRFToken(): string {
  const token = crypto.randomBytes(32).toString('hex')
  const expires = Date.now() + (15 * 60 * 1000) // 15 minutes
  
  // Store token with expiration
  csrfTokens.set(token, { token, expires })
  
  // Clean up expired tokens
  cleanupExpiredTokens()
  
  return token
}

// Verify CSRF token
export function verifyCSRFToken(token: string): boolean {
  if (!token) return false
  
  const stored = csrfTokens.get(token)
  if (!stored) return false
  
  // Check if token is expired
  if (Date.now() > stored.expires) {
    csrfTokens.delete(token)
    return false
  }
  
  return true
}

// Clean up expired tokens
function cleanupExpiredTokens(): void {
  const now = Date.now()
  for (const [token, data] of csrfTokens.entries()) {
    if (now > data.expires) {
      csrfTokens.delete(token)
    }
  }
}

// Get CSRF token for a session
export function getCSRFToken(_sessionId: string): string {
  // In a real implementation, you'd store this in the database
  // For now, we'll generate a new token each time
  return generateCSRFToken()
}

// CSRF middleware for API routes
export function csrfMiddleware(req: Request): { isValid: boolean; token?: string } {
  const token = req.headers.get('x-csrf-token')
  
  if (!token) {
    return { isValid: false }
  }
  
  const isValid = verifyCSRFToken(token)
  return { isValid, token: isValid ? token : undefined }
}

// CSRF protection for forms
export function createCSRFFormData(formData: FormData): FormData {
  const token = generateCSRFToken()
  formData.append('_csrf', token)
  return formData
}

// Validate CSRF token from form data
export function validateCSRFFormData(formData: FormData): boolean {
  const token = formData.get('_csrf') as string
  return verifyCSRFToken(token)
}

// CSRF token for client-side requests
export function getCSRFTokenForRequest(): string {
  return generateCSRFToken()
}

// Rate limiting for CSRF token generation
const csrfRateLimit = new Map<string, { count: number; resetTime: number }>()

export function checkCSRFRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const windowMs = 5 * 60 * 1000 // 5 minutes
  const maxRequests = 10 // 10 CSRF token requests per 5 minutes
  
  const current = csrfRateLimit.get(ip)
  
  if (!current) {
    csrfRateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (now > current.resetTime) {
    csrfRateLimit.set(ip, { count: 1, resetTime: now + windowMs })
    return { allowed: true }
  }
  
  if (current.count >= maxRequests) {
    return { 
      allowed: false, 
      retryAfter: Math.ceil((current.resetTime - now) / 1000) 
    }
  }
  
  current.count++
  return { allowed: true }
}
