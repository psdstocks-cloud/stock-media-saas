import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    console.log('🔍 Auto-login attempt...')
    
    // Check if user has a global session
    const session = await auth()
    console.log('🔍 Global session:', session ? { user: session.user?.email, role: (session.user as any)?.role } : 'No session')
    
    if (!session?.user) {
      return NextResponse.json({ 
        success: false,
        message: 'No global session found',
        error: 'NO_SESSION'
      }, { status: 401 })
    }

    // Check if user is admin
    const userRole = (session.user as any).role
    if (userRole !== 'ADMIN' && userRole !== 'SUPER_ADMIN') {
      return NextResponse.json({ 
        success: false,
        message: 'Admin privileges required',
        error: 'NOT_ADMIN'
      }, { status: 403 })
    }

    // Create JWT token for admin session
    const jwtSecret = process.env.NEXTAUTH_SECRET
    if (!jwtSecret) {
      console.error('❌ NEXTAUTH_SECRET is not set')
      return NextResponse.json({ 
        success: false,
        message: 'Server configuration error',
        error: 'JWT_SECRET_MISSING'
      }, { status: 500 })
    }

    const token = jwt.sign(
      { 
        id: (session.user as any).id || 'unknown',
        email: session.user.email || '',
        name: session.user.name || '',
        role: userRole
      },
      jwtSecret,
      { expiresIn: '24h' }
    )

    console.log('🎫 Auto-login JWT token created for user:', session.user.email)

    // Set HTTP-only cookie with the token
    const response = NextResponse.json({ 
      success: true, 
      message: 'Auto-login successful',
      user: {
        id: (session.user as any).id || 'unknown',
        email: session.user.email,
        name: session.user.name,
        role: userRole
      }
    })

    response.cookies.set('auth-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    })

    console.log('✅ Auto-login successful, cookie set')
    return response

  } catch (error) {
    console.error('Auto-login error:', error)
    return NextResponse.json({ 
      success: false,
      message: 'Auto-login failed',
      error: 'AUTO_LOGIN_ERROR'
    }, { status: 500 })
  }
}
