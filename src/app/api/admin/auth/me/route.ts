import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Auth Check] API called from:', request.headers.get('referer'))
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      console.log('❌ [Auth Check] No access token found in cookies')
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'NO_TOKEN',
          message: 'No access token found'
        },
        { status: 401 }
      )
    }

    console.log('🎫 [Auth Check] Access token found, length:', accessToken.length)

    // Verify JWT token
    let payload
    try {
      payload = await verifyToken(accessToken)
      console.log('✅ [Auth Check] Token verified for user:', payload.sub, 'role:', payload.role)
    } catch (tokenError) {
      console.log('❌ [Auth Check] Token verification failed:', (tokenError as Error).message)
      
      // Clear invalid cookies
      const response = NextResponse.json(
        { 
          authenticated: false, 
          error: 'INVALID_TOKEN',
          message: 'Token verification failed'
        },
        { status: 401 }
      )
      
      response.cookies.delete('admin_access_token')
      response.cookies.delete('admin_refresh_token')
      return response
    }

    // Check if user exists in database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true
      }
    })

    if (!user) {
      console.log('❌ [Auth Check] User not found in database:', payload.sub)
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'USER_NOT_FOUND',
          message: 'User not found'
        },
        { status: 401 }
      )
    }

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ [Auth Check] User lacks admin privileges:', user.role)
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'INSUFFICIENT_PRIVILEGES',
          message: 'Admin privileges required'
        },
        { status: 403 }
      )
    }

    console.log('✅ [Auth Check] Admin authentication successful for:', user.email)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('💥 [Auth Check] Unexpected error:', error)
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'INTERNAL_ERROR',
        message: 'Authentication check failed',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}