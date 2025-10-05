import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Auth Me] Checking unified auth status')
    
    const cookieStore = await cookies()
    
    // Check both possible cookie names
    let accessToken = cookieStore.get('user_access_token')?.value || 
                      cookieStore.get('admin_access_token')?.value
    
    if (!accessToken) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
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
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    const isAdmin = user.role === 'ADMIN' || user.role === 'SUPER_ADMIN'
    const isUser = true // Everyone can access user features

    console.log('✅ [Auth Me] User found:', {
      email: user.email,
      role: user.role,
      isAdmin,
      isUser
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin,
        isUser
      }
    })

  } catch (error) {
    console.error('❌ [Auth Me] Error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Failed to check auth status'
    })
  }
}
