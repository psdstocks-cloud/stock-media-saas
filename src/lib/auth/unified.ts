import { NextRequest } from 'next/server'
import { verifyToken, UserJWTPayload } from './jwt'
import { prisma } from '@/lib/prisma'

export interface UnifiedUser {
  id: string
  email: string
  name: string | null
  role: string
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
    
    return user
  } catch (error) {
    console.error('❌ Unified auth verification failed:', error)
    return null
  }
}