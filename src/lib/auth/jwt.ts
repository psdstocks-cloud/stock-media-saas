import { SignJWT, jwtVerify } from 'jose'

// More robust JWT_SECRET handling
const getJWTSecret = () => {
  const secret = process.env.JWT_SECRET || process.env.NEXTAUTH_SECRET || 'fallback-secret-key-minimum-32-characters-long-for-development-only'
  
  if (process.env.NODE_ENV === 'production' && secret.includes('fallback')) {
    console.error('🚨 CRITICAL: Using fallback JWT secret in production!')
  }
  
  return new TextEncoder().encode(secret)
}

const JWT_SECRET = getJWTSecret()
const JWT_ISSUER = 'stockmedia-admin'
const JWT_AUDIENCE = 'stockmedia-admin'

export interface JWTPayload {
  sub: string // user id
  email: string
  role: string
  sessionId?: string
  type?: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export interface UserJWTPayload {
  sub: string // user ID
  email: string
  name?: string | null
  role?: string
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh') {
  const expiresIn = type === 'access' ? '1h' : '7d' // Increased access token time
  
  try {
    console.log(`🔐 [JWT] Signing ${type} token for user:`, payload.sub)
    
    return await new SignJWT({ ...payload, type })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET)
  } catch (error) {
    console.error('❌ JWT Sign Error:', error)
    throw new Error(`Token signing failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// User token generation (simpler, no session management)
export async function generateToken(payload: Omit<UserJWTPayload, 'iat' | 'exp'>): Promise<string> {
  try {
    console.log(`🔐 [JWT] Generating user token for:`, payload.sub)
    
    return await new SignJWT(payload)
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime('7d') // 7 days
      .sign(JWT_SECRET)
  } catch (error) {
    console.error('❌ User JWT Sign Error:', error)
    throw new Error(`User token generation failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function verifyToken(token: string): Promise<JWTPayload | UserJWTPayload> {
  try {
    console.log('🔐 [JWT] Verifying token, length:', token.length)
    
    // Try with issuer/audience first (admin tokens)
    try {
      const { payload } = await jwtVerify(token, JWT_SECRET, {
        issuer: JWT_ISSUER,
        audience: JWT_AUDIENCE,
      })
      
      console.log('✅ [JWT] Admin token verified for user:', (payload as any).sub)
      return payload as unknown as JWTPayload
    } catch (adminError) {
      // If admin verification fails, try without issuer/audience (user tokens)
      const { payload } = await jwtVerify(token, JWT_SECRET)
      
      console.log('✅ [JWT] User token verified for user:', (payload as any).sub)
      return payload as unknown as UserJWTPayload
    }
  } catch (error) {
    console.error('❌ JWT Verify Error:', error)
    
    if (error instanceof Error) {
      if (error.message.includes('exp')) {
        throw new Error('Token has expired')
      }
      if (error.message.includes('aud')) {
        throw new Error('Token audience mismatch')
      }
      if (error.message.includes('iss')) {
        throw new Error('Token issuer mismatch')
      }
    }
    
    throw new Error(`Invalid or expired token: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split('.')
    if (parts.length !== 3) return true
    
    const payload = JSON.parse(atob(parts[1]))
    const now = Math.floor(Date.now() / 1000)
    
    return payload.exp && payload.exp < now
  } catch {
    return true
  }
}

// Helper to check if user is admin
export function isAdmin(role?: string): boolean {
  return role === 'ADMIN' || role === 'SUPER_ADMIN'
}

// Helper to check if user is super admin
export function isSuperAdmin(role?: string): boolean {
  return role === 'SUPER_ADMIN'
}
