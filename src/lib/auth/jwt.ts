import { SignJWT, jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
const JWT_ISSUER = 'stockmedia-admin'
const JWT_AUDIENCE = 'stockmedia-admin'

export interface JWTPayload {
  sub: string // user id
  email: string
  role: string
  sessionId: string
  type: 'access' | 'refresh'
}

export async function signToken(payload: Omit<JWTPayload, 'type'>, type: 'access' | 'refresh') {
  const expiresIn = type === 'access' ? '15m' : '7d'
  
  return await new SignJWT({ ...payload, type })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setIssuer(JWT_ISSUER)
    .setAudience(JWT_AUDIENCE)
    .setExpirationTime(expiresIn)
    .sign(JWT_SECRET)
}

export async function verifyToken(token: string): Promise<JWTPayload> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET, {
      issuer: JWT_ISSUER,
      audience: JWT_AUDIENCE,
    })
    
    return payload as unknown as JWTPayload
  } catch (error) {
    throw new Error('Invalid token')
  }
}
