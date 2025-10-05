import { NextRequest } from 'next/server'
import { verifyToken, UserJWTPayload } from './jwt'
import { prisma } from '@/lib/prisma'

export interface UnifiedUser {
  id: string
  email: string
  name: string | null
  role: string
  isAdmin: boolean
  isUser: boolean
}

export async function getUnifiedAuth(request: NextRequest): Promise<UnifiedUser | null> {
  try {
    // Try to get token from cookies
    const accessToken = request.cookies.get('user_access_token')?.value
    
    if (!accessToken) {
      return null
    }
    
    const payload = await verifyToken(accessToken) as UserJWTPayload
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    })
    
    if (!user) {
      return null
    }
    
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isUser = true // Everyone can access user features
    
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      isAdmin,
      isUser
    }
  } catch (error) {
    console.error('❌ Unified auth verification failed:', error)
    return null
  }
}