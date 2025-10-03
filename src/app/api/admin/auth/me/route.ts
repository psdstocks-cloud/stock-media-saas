import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth check API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      console.log('❌ No access token found')
      return NextResponse.json(
        { error: 'No access token', authenticated: false },
        { status: 401 }
      )
    }

    console.log('🎫 Access token found, verifying...')

    const payload = await verifyToken(accessToken)
    console.log('✅ Token verified for user:', payload.sub)

    // Get user from database
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user) {
      console.log('❌ User not found in database:', payload.sub)
      return NextResponse.json(
        { error: 'User not found', authenticated: false },
        { status: 401 }
      )
    }

    console.log('👤 User authenticated:', user.email)

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('❌ Auth check error:', error)
    return NextResponse.json(
      { 
        error: 'Invalid token', 
        authenticated: false,
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 401 }
    )
  }
}