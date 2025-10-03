import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { rateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 Login API called')

    // Rate limiting
    const isAllowed = await rateLimit(request, 'admin_login', 5, 900) // 5 attempts per 15 minutes
    if (!isAllowed) {
      console.log('❌ Rate limit exceeded')
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      )
    }

    const body = await request.json()
    console.log('📋 Request body:', { email: body.email })
    
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.password) {
      console.log('❌ User not found:', email)
      await new Promise(resolve => setTimeout(resolve, 1000)) // Prevent timing attacks
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    console.log('👤 User found:', user.email, 'Role:', user.role)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('❌ Invalid password for:', email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ Insufficient permissions:', user.role)
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Create session (simplified - using user ID as session token for now)
    const sessionToken = `session_${user.id}_${Date.now()}`
    const refreshToken = `refresh_${user.id}_${Date.now()}`
    
    // Generate tokens
    const accessToken = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: sessionToken,
    }, 'access')

    const refreshTokenJWT = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: sessionToken,
    }, 'refresh')

    console.log('✅ Tokens generated successfully')

    // Set cookies
    const cookieStore = await cookies()
    cookieStore.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    cookieStore.set('admin_refresh_token', refreshTokenJWT, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    console.log('🍪 Cookies set successfully')

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    })
  } catch (error) {
    console.error('💥 Login error:', error)
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}