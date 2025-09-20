import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { checkLoginRateLimit, getClientIdentifier } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json()
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'

    console.log('Login attempt:', { email, clientIP })

    // Validate input
    if (!email || !password) {
      return NextResponse.json({
        error: 'Email and password are required',
        type: 'MISSING_CREDENTIALS'
      }, { status: 400 })
    }

    // Apply rate limiting
    const clientIdentifier = getClientIdentifier(request)
    const rateLimitResult = await checkLoginRateLimit(clientIdentifier)
    if (!rateLimitResult.success) {
      console.warn('Rate limit exceeded for login:', {
        clientIdentifier,
        clientIP,
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString(),
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        error: 'Too many login attempts. Please try again later.',
        type: 'RATE_LIMIT_EXCEEDED',
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString()
      }, { 
        status: 429,
        headers: rateLimitResult.headers
      })
    }

    // Normalize email
    const normalizedEmail = email.trim().toLowerCase()

    // Find user with password
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        password: true,
        role: true,
        loginAttempts: true,
        lockedUntil: true,
        lastLoginAt: true,
        emailVerified: true,
        onboardingCompleted: true
      }
    })

    if (!user) {
      console.warn('Login attempt with non-existent email:', {
        email: normalizedEmail,
        clientIP,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        error: 'Invalid email or password',
        type: 'INVALID_CREDENTIALS'
      }, { status: 401 })
    }

    // Check if account is locked
    if (user.lockedUntil && user.lockedUntil > new Date()) {
      console.warn('Login attempt on locked account:', {
        userId: user.id,
        email: user.email,
        lockedUntil: user.lockedUntil.toISOString(),
        clientIP,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        error: 'Account is temporarily locked due to too many failed login attempts. Please try again later.',
        type: 'ACCOUNT_LOCKED',
        lockedUntil: user.lockedUntil.toISOString()
      }, { status: 423 })
    }

    // Check if user has password (not OAuth only)
    if (!user.password) {
      console.warn('Login attempt on OAuth-only account:', {
        userId: user.id,
        email: user.email,
        clientIP,
        timestamp: new Date().toISOString()
      })
      
      return NextResponse.json({
        error: 'This account was created using social login. Please use the appropriate social login method.',
        type: 'OAUTH_ONLY_ACCOUNT'
      }, { status: 401 })
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password)

    if (!isValidPassword) {
      // Increment login attempts
      const newLoginAttempts = user.loginAttempts + 1
      const lockUntil = newLoginAttempts >= 5 ? new Date(Date.now() + 15 * 60 * 1000) : null // Lock for 15 minutes after 5 attempts

      await prisma.user.update({
        where: { id: user.id },
        data: {
          loginAttempts: newLoginAttempts,
          lockedUntil: lockUntil
        }
      })

      console.warn('Failed login attempt:', {
        userId: user.id,
        email: user.email,
        attemptCount: newLoginAttempts,
        clientIP,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        error: 'Invalid email or password',
        type: 'INVALID_CREDENTIALS',
        remainingAttempts: Math.max(0, 5 - newLoginAttempts)
      }, { status: 401 })
    }

    // Successful login - reset login attempts and update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginAttempts: 0,
        lockedUntil: null,
        lastLoginAt: new Date()
      }
    })

    // Log successful login
    console.log('Successful login:', {
      userId: user.id,
      email: user.email,
      role: user.role,
      clientIP,
      timestamp: new Date().toISOString()
    })

    // Return user data (without password)
    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        emailVerified: user.emailVerified,
        onboardingCompleted: user.onboardingCompleted,
        lastLoginAt: user.lastLoginAt
      }
    }, {
      headers: rateLimitResult.headers
    })

  } catch (error) {
    console.error('Login API error:', error)
    return NextResponse.json({
      error: 'An error occurred during login',
      type: 'LOGIN_ERROR'
    }, { status: 500 })
  }
}
