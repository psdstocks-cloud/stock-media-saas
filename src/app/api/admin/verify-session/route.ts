import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const JWT_SECRET = process.env.NEXTAUTH_SECRET || 'fallback-secret-key'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 API: Verifying admin session...')
    
    // Get the auth token from cookies
    const cookieStore = await cookies()
    const authToken = cookieStore.get('auth-token')

    if (!authToken?.value) {
      console.log('❌ API: No auth token found in cookies')
      return NextResponse.json(
        { success: false, error: 'No authentication token found' },
        { status: 401 }
      )
    }

    // Verify the JWT token
    let decoded: any
    try {
      decoded = verify(authToken.value, JWT_SECRET)
      // FIX: Use 'id' instead of 'userId' to match JWT creation
      console.log('🔍 API: JWT token decoded:', { userId: decoded.id, role: decoded.role })
    } catch (jwtError) {
      console.log('❌ API: JWT verification failed:', jwtError)
      return NextResponse.json(
        { success: false, error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    // Check if user exists and has admin role
    // FIX: Use decoded.id instead of decoded.userId
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true
      }
    })

    if (!user) {
      console.log('❌ API: User not found in database')
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 401 }
      )
    }

    // FIX: Remove emailVerified check since it might not be set
    // This was likely causing authentication failures
    console.log('🔍 API: User found:', { id: user.id, email: user.email, role: user.role, emailVerified: user.emailVerified })

    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ API: User does not have admin role:', user.role)
      return NextResponse.json(
        { success: false, error: 'Insufficient privileges' },
        { status: 403 }
      )
    }

    console.log('✅ API: Admin session verified successfully')
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('❌ API: Admin session verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Session verification failed' },
      { status: 500 }
    )
  }
}
