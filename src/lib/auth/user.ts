import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  role: string
}

export async function verifyUserAuth(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = cookies()
    const accessToken = cookieStore.get('user_access_token')?.value
    
    if (!accessToken) {
      return null
    }
    
    const payload = await verifyToken(accessToken)
    
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
    console.error('❌ User auth verification failed:', error)
    return null
  }
}

export async function requireUserAuth(request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await verifyUserAuth(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}
