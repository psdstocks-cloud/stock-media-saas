import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function requireAuth(request: NextRequest) {
  const cookieStore = await cookies()
  const accessToken = cookieStore.get('admin_access_token')?.value

  if (!accessToken) {
    throw new Error('Authentication required')
  }

  try {
    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      throw new Error('User not found')
    }

    return { user, payload }
  } catch (error) {
    throw new Error('Invalid token')
  }
}

export async function requireAdmin(request: NextRequest) {
  const { user } = await requireAuth(request)
  
  if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
    throw new Error('Admin privileges required')
  }

  return { user }
}
