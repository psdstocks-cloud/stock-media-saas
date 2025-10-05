import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const requestId = Date.now().toString(36) // Unique request ID for tracking
  
  try {
    console.log(`🔍 [Auth Check ${requestId}] Starting auth check`)
    console.log(`📋 [Auth Check ${requestId}] Request from:`, request.headers.get('referer') || 'direct')
    console.log(`🌍 [Auth Check ${requestId}] User Agent:`, request.headers.get('user-agent')?.slice(0, 100) || 'unknown')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value
    const refreshToken = cookieStore.get('admin_refresh_token')?.value

    console.log(`🍪 [Auth Check ${requestId}] Access token:`, accessToken ? `Found (${accessToken.length} chars)` : 'Not found')
    console.log(`🍪 [Auth Check ${requestId}] Refresh token:`, refreshToken ? `Found (${refreshToken.length} chars)` : 'Not found')

    if (!accessToken) {
      console.log(`❌ [Auth Check ${requestId}] No access token in cookies`)
      
      // Try to use refresh token to get new access token
      if (refreshToken) {
        console.log(`🔄 [Auth Check ${requestId}] Attempting to refresh token`)
        
        try {
          const refreshPayload = await verifyToken(refreshToken)
          
          // Check if it's a valid refresh token (has type property and is 'refresh')
          if ('type' in refreshPayload && refreshPayload.type === 'refresh') {
            console.log(`🎫 [Auth Check ${requestId}] Refresh token valid, generating new access token`)
            
            // Generate new access token
            const { signToken } = await import('@/lib/auth/jwt')
            const newAccessToken = await signToken({
              sub: refreshPayload.sub,
              email: refreshPayload.email,
              role: refreshPayload.role,
              sessionId: refreshPayload.sessionId
            }, 'access')
            
            // Set new access token cookie
            const response = NextResponse.json({
              authenticated: true,
              user: {
                id: refreshPayload.sub,
                email: refreshPayload.email,
                role: refreshPayload.role,
              }
            })
            
            response.cookies.set('admin_access_token', newAccessToken, {
              httpOnly: true,
              secure: process.env.NODE_ENV === 'production',
              sameSite: 'lax',
              maxAge: 60 * 60, // 1 hour
              path: '/',
            })
            
            console.log(`✅ [Auth Check ${requestId}] Token refreshed successfully`)
            return response
          } else {
            console.log(`❌ [Auth Check ${requestId}] Refresh token is not a valid refresh token`)
          }
        } catch (refreshError) {
          console.log(`❌ [Auth Check ${requestId}] Refresh token invalid:`, (refreshError as Error).message)
        }
      }
      
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'NO_TOKEN',
          message: 'No valid authentication token found'
        },
        { status: 401 }
      )
    }

    // Verify access token
    let payload
    try {
      payload = await verifyToken(accessToken)
      console.log(`✅ [Auth Check ${requestId}] Access token verified for:`, payload.email, `(${payload.role})`)
    } catch (tokenError) {
      console.log(`❌ [Auth Check ${requestId}] Access token verification failed:`, (tokenError as Error).message)
      
      // Clear invalid cookies and return 401
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

    // Verify user exists in database
    console.log(`🔍 [Auth Check ${requestId}] Checking user in database:`, payload.sub)
    
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
      console.log(`❌ [Auth Check ${requestId}] User not found in database:`, payload.sub)
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'USER_NOT_FOUND',
          message: 'User account not found'
        },
        { status: 401 }
      )
    }

    // Check admin permissions
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log(`❌ [Auth Check ${requestId}] Insufficient privileges:`, user.role)
      return NextResponse.json(
        { 
          authenticated: false, 
          error: 'INSUFFICIENT_PRIVILEGES',
          message: 'Admin privileges required'
        },
        { status: 403 }
      )
    }

    console.log(`🎉 [Auth Check ${requestId}] Authentication successful for:`, user.email, `(${user.role})`)

    // Add cache headers to reduce repeated calls
    const response = NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })
    
    // Cache for 30 seconds to prevent excessive calls
    response.headers.set('Cache-Control', 'private, max-age=30')
    
    return response

  } catch (error) {
    console.error(`💥 [Auth Check ${requestId}] Unexpected error:`, error)
    return NextResponse.json(
      { 
        authenticated: false, 
        error: 'INTERNAL_ERROR',
        message: 'Authentication check failed due to server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}