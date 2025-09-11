import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import crypto from 'crypto'
import { sendPasswordResetEmail } from '@/lib/email'
import { checkPasswordResetRateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email address is required' },
        { status: 400 }
      )
    }

    // Check if email format is valid
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Check rate limit
    const clientIP = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await checkPasswordResetRateLimit(clientIP)
    
    if (!rateLimitResult.success) {
      const retryAfterMinutes = Math.ceil((rateLimitResult.reset - Date.now()) / 60000)
      
      return NextResponse.json(
        { 
          error: `Too many password reset requests. Please try again in ${retryAfterMinutes} minute${retryAfterMinutes !== 1 ? 's' : ''}.`,
          remaining: rateLimitResult.remaining,
          resetTime: new Date(rateLimitResult.reset).toISOString(),
          type: 'RATE_LIMIT_EXCEEDED'
        },
        { status: 429 }
      )
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })

    // Always return success to prevent email enumeration attacks
    // But only send email if user exists
    if (user) {
      // Check persistent timer in database
      const emailTimer = await prisma.emailResendTimer.findUnique({
        where: { email: email.toLowerCase() }
      })

      const now = new Date()
      const minInterval = 3 * 60 * 1000 // 3 minutes minimum between requests

      if (emailTimer) {
        const timeSinceLastRequest = now.getTime() - emailTimer.lastSentAt.getTime()
        
        if (timeSinceLastRequest < minInterval) {
          const remainingTime = Math.ceil((minInterval - timeSinceLastRequest) / 1000)
          const remainingMinutes = Math.ceil(remainingTime / 60)
          
          return NextResponse.json({
            success: false,
            message: `Please wait ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''} before requesting another reset email.`,
            type: 'TOO_FREQUENT',
            retryAfter: remainingTime,
            remainingMinutes: remainingMinutes,
            nextAllowedAt: emailTimer.nextAllowedAt.getTime()
          })
        }
      }

      // Generate secure reset token
      const resetToken = crypto.randomBytes(32).toString('hex')
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour from now
      const nextAllowedAt = new Date(now.getTime() + minInterval)

      // Store reset token and update timer in database
      await prisma.$transaction(async (tx) => {
        // Create or update reset token
        await tx.passwordResetToken.create({
          data: {
            token: resetToken,
            userId: user.id,
            email: user.email,
            expiresAt: expiresAt
          }
        })

        // Create or update email timer
        await tx.emailResendTimer.upsert({
          where: { email: email.toLowerCase() },
          update: {
            lastSentAt: now,
            nextAllowedAt: nextAllowedAt
          },
          create: {
            email: email.toLowerCase(),
            lastSentAt: now,
            nextAllowedAt: nextAllowedAt
          }
        })
      })

      // Send password reset email
      try {
        await sendPasswordResetEmail(user.email, resetToken, user.name || 'User')
        console.log(`Password reset email sent to ${user.email}`)
      } catch (emailError) {
        console.error('Failed to send password reset email:', emailError)
        // Don't fail the request if email sending fails
        // The token is still created and valid
      }
    }

    // Always return success message with security guidance
    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we\'ve sent a password reset link.',
      security: {
        checkInbox: true,
        checkSpam: true,
        expiresIn: '1 hour',
        nextRequestIn: '3 minutes'
      },
      rateLimit: {
        remaining: rateLimitResult.remaining,
        resetTime: new Date(rateLimitResult.reset).toISOString()
      },
      timer: {
        duration: 180, // 3 minutes in seconds
        nextAllowedAt: user ? new Date(Date.now() + 3 * 60 * 1000).getTime() : null
      }
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again.' },
      { status: 500 }
    )
  }
}
