import jwt from 'jsonwebtoken'
import { NextRequest } from 'next/server'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret'

export interface JWTPayload {
  id: string
  email: string
  name: string | null
  role: string
  iat?: number
  exp?: number
}

export function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as JWTPayload
  } catch (error) {
    console.error('JWT verification failed:', error)
    return null
  }
}

export function getTokenFromRequest(request: Request | NextRequest): string | null {
  // Try to get token from cookie first (NextRequest only)
  if ('cookies' in request && request.cookies) {
    const cookieToken = request.cookies.get('auth-token')?.value
    if (cookieToken) {
      return cookieToken
    }
  }

  // Try to get token from Authorization header
  const authHeader = request.headers.get('authorization')
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7)
  }

  return null
}

export function getUserFromRequest(request: Request | NextRequest): JWTPayload | null {
  const token = getTokenFromRequest(request)
  if (!token) {
    return null
  }

  return verifyJWT(token)
}
