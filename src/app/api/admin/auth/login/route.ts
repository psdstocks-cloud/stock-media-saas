import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import bcrypt from 'bcryptjs'
import { z } from 'zod'
import { prisma } from '@/lib/prisma'
import { signToken } from '@/lib/auth/jwt'
import { rateLimiters } from '@/lib/rate-limit'

const loginSchema = z.object({
  email: z.string().email('Invalid email'),
  password: z.string().min(1, 'Password is required'),
})

export async function POST(request: NextRequest) {
  try {
    // Rate limiting - simplified for now
    // TODO: Implement proper rate limiting with rateLimiters

    const body = await request.json()
    const { email, password } = loginSchema.parse(body)

    // Find user
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user || !user.password) {
      await new Promise(resolve => setTimeout(resolve, 1000)) // Prevent timing attacks
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)
    if (!isValidPassword) {
      await new Promise(resolve => setTimeout(resolve, 1000))
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Check admin role
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json(
        { error: 'Access denied. Admin privileges required.' },
        { status: 403 }
      )
    }

    // Create session
    const sessionToken = crypto.randomUUID()
    const refreshToken = crypto.randomUUID()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    const session = await prisma.adminSession.create({
      data: {
        userId: user.id,
        sessionToken,
        refreshToken,
        expiresAt,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    // Generate tokens
    const accessToken = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    }, 'access')

    const refreshTokenJWT = await signToken({
      sub: user.id,
      email: user.email,
      role: user.role,
      sessionId: session.id,
    }, 'refresh')

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

    // Audit log
    await prisma.adminAuditLog.create({
      data: {
        adminId: user.id,
        action: 'LOGIN',
        resourceType: 'AUTH',
        newValues: JSON.stringify({ success: true }),
        reason: 'Admin login successful',
      },
    })

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
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
