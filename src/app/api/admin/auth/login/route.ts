import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { rateLimit } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Invalid email format'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    console.log('🚀 [Admin Login] API called')

    // Rate limiting (5 attempts per 15 minutes)
    const isAllowed = await rateLimit(request, 'admin_login', 5, 900)
    if (!isAllowed) {
      console.log('❌ [Admin Login] Rate limit exceeded')
      return NextResponse.json(
        { 
          success: false, 
          error: 'RATE_LIMITED',
          message: 'Too many login attempts. Please try again in 15 minutes.'
        },
        { status: 429 }
      )
    }

    const body = await request.json()
    console.log('📋 [Admin Login] Login attempt for:', body.email)
    
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        password: true,
        emailVerified: true
      }
    })

    if (!user || !user.password) {
      console.log('❌ [Admin Login] User not found or no password:', email)
      // Prevent timing attacks
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    console.log('👤 [Admin Login] User found:', user.email, 'Role:', user.role)

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      console.log('❌ [Admin Login] Invalid password for:', email)
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { 
          success: false, 
          error: 'INVALID_CREDENTIALS',
          message: 'Invalid email or password'
        },
        { status: 401 }
      )
    }

    // Check admin privileges
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ [Admin Login] Insufficient privileges:', user.role)
      return NextResponse.json(
        { 
          success: false, 
          error: 'ACCESS_DENIED',
          message: 'Admin privileges required'
        },
        { status: 403 }
      )
    }

    // Create session identifiers
    const sessionId = `sess_${user.id}_${Date.now()}`
    
    // Generate JWT tokens
    const tokenPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId
    }

    const accessToken = await signToken(tokenPayload, 'access')
    const refreshToken = await signToken(tokenPayload, 'refresh')

    console.log('✅ [Admin Login] Tokens generated for:', user.email)

    // Set secure HTTP-only cookies
    const cookieStore = await cookies()
    
    // Access token (15 minutes)
    cookieStore.set('admin_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    // Refresh token (7 days)
    cookieStore.set('admin_refresh_token', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    })

    console.log('🍪 [Admin Login] Cookies set successfully')

    // Create audit log entry
    try {
      await prisma.adminAuditLog.create({
        data: {
          adminId: user.id,
          action: 'LOGIN_SUCCESS',
          resourceType: 'AUTH',
          resourceId: user.id,
          newValues: JSON.stringify({
            email: user.email,
            role: user.role,
            sessionId,
            timestamp: new Date().toISOString()
          }),
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown',
        }
      })
    } catch (auditError) {
      console.warn('⚠️ [Admin Login] Audit log failed:', auditError)
      // Don't fail login if audit logging fails
    }

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      }
    })

  } catch (error) {
    console.error('💥 [Admin Login] Unexpected error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'VALIDATION_ERROR',
          message: 'Invalid input data',
          details: error.errors
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'INTERNAL_ERROR',
        message: 'Login failed due to server error',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}