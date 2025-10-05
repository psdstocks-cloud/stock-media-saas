import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from './jwt'
import { prisma } from '@/lib/prisma'

export interface AuthenticatedUser {
  id: string
  email: string
  name: string | null
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN'
  isAdmin: boolean
  isUser: boolean
}

export async function getAuthenticatedUser(request?: NextRequest): Promise<AuthenticatedUser | null> {
  try {
    const cookieStore = await cookies()
    
    // Check both possible cookie names (prioritize user, then admin for backward compatibility)
    let accessToken = cookieStore.get('user_access_token')?.value || 
                      cookieStore.get('admin_access_token')?.value
    
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
    
    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isUser = user.role === 'USER' || isAdmin // Admins can access user features too
    
    return {
      ...user,
      role: user.role as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
      isAdmin,
      isUser
    }
    
  } catch (error) {
    console.error('❌ Unified auth verification failed:', error)
    return null
  }
}

export async function requireAuth(request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user) {
    throw new Error('Authentication required')
  }
  
  return user
}

export async function requireAdmin(request?: NextRequest): Promise<AuthenticatedUser> {
  const user = await getAuthenticatedUser(request)
  
  if (!user || !user.isAdmin) {
    throw new Error('Admin access required')
  }
  
  return user
}
