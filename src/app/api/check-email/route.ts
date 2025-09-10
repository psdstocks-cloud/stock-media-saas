import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { checkEmailVerificationRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'

    if (!email || typeof email !== 'string') {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    // Apply rate limiting
    const rateLimitResult = checkEmailVerificationRateLimit(email.toLowerCase().trim())
    if (!rateLimitResult.allowed) {
      return NextResponse.json({
        error: 'Too many email verification attempts. Please try again later.',
        type: 'RATE_LIMIT_EXCEEDED',
        retryAfter: rateLimitResult.retryAfter,
        remaining: rateLimitResult.remaining,
        resetTime: rateLimitResult.resetTime
      }, { status: 429 })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        exists: false, 
        message: 'Please enter a valid email address' 
      })
    }

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() },
      include: {
        accounts: true
      }
    })

    if (existingUser) {
      // Log email check for security monitoring
      console.log('Email existence check:', {
        email: email.toLowerCase(),
        exists: true,
        hasPassword: !!existingUser.password,
        hasOAuthAccounts: existingUser.accounts.length > 0,
        providers: existingUser.accounts.map(acc => acc.provider),
        clientIP,
        timestamp: new Date().toISOString()
      })

      // Determine appropriate message based on account type
      if (existingUser.accounts.length > 0) {
        const providers = existingUser.accounts.map(acc => acc.provider).join(', ')
        return NextResponse.json({
          exists: true,
          message: `An account with this email already exists. Please sign in using ${providers}.`,
          providers: existingUser.accounts.map(acc => acc.provider),
          hasPassword: !!existingUser.password
        })
      } else if (existingUser.password) {
        return NextResponse.json({
          exists: true,
          message: 'An account with this email already exists. Please sign in or reset your password.',
          hasPassword: true
        })
      } else {
        return NextResponse.json({
          exists: true,
          message: 'An account with this email already exists. Please contact support.',
          hasPassword: false
        })
      }
    }

    // Email is available
    return NextResponse.json({
      exists: false,
      message: 'Email is available'
    })

  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'An error occurred while checking email availability' },
      { status: 500 }
    )
  }
}
