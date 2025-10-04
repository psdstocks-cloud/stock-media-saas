import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key-minimum-32-characters-long')
const JWT_ISSUER = 'stockmedia-admin'
const JWT_AUDIENCE = 'stockmedia-admin'

export interface JWTPayload {
  sub: string // user id
  email: string
  role: string
  sessionId: string
  type: 'access' | 'refresh'
  iat?: number
  exp?: number
}

export async function signToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh') {
  const expiresIn = type === 'access' ? '15m' : '7d'
  
  try {
    return await new SignJWT({ ...payload, type })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setIssuer(JWT_ISSUER)
      .setAudience(JWT_AUDIENCE)
      .setExpirationTime(expiresIn)
      .sign(JWT_SECRET)
  } catch (error) {
    console.error('❌ JWT Sign Error:', error)
    throw new Error('Token signing failed')
  }
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    
    return payload as unknown as JWTPayload
  } catch (error) {
    console.error('❌ JWT Verify Error:', error)
    throw new Error('Invalid or expired token')
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
