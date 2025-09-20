import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendVerificationEmail } from '@/lib/verification-tokens'
import { z } from 'zod'

const resendVerificationSchema = z.object({
  email: z.string().email('Invalid email format')
})

export async function POST(request: NextRequest) {
  try {
    console.log('Resend verification API called')
    const body = await request.json()
    
    // Validate input
    const validation = resendVerificationSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email format',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { email } = validation.data
    const normalizedEmail = email.trim().toLowerCase()

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: {
        id: true,
        email: true,
        name: true,
        emailVerified: true
      }
    })

    if (!user) {
      console.warn('Resend verification attempt for non-existent email:', { email: normalizedEmail })
      // Return success to avoid email enumeration
      return NextResponse.json({
        success: true,
        message: 'If an account with that email exists, a verification email has been sent.'
      })
    }

    // Check if email is already verified
    if (user.emailVerified) {
      console.log('Resend verification attempt for already verified email:', { 
        userId: user.id,
        email: user.email 
      })
      return NextResponse.json({
        success: true,
        message: 'Email is already verified. You can log in normally.',
        alreadyVerified: true
      })
    }

    // Check for recent verification emails (rate limiting)
    const recentTokens = await prisma.emailVerificationToken.findMany({
      where: {
        userId: user.id,
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    })

    if (recentTokens.length > 0) {
      console.warn('Rate limit exceeded for resend verification:', {
        userId: user.id,
        email: user.email,
        recentTokensCount: recentTokens.length
      })
      
      return NextResponse.json({
        success: false,
        error: 'Please wait 5 minutes before requesting another verification email.'
      }, { status: 429 })
    }

    // Send verification email
    const verificationSent = await sendVerificationEmail(
      user.id,
      user.email,
      user.name || undefined
    )

    if (verificationSent) {
      console.log('Verification email resent successfully:', {
        userId: user.id,
        email: user.email,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json({
        success: true,
        message: 'Verification email sent successfully. Please check your inbox and spam folder.'
      })
    } else {
      console.error('Failed to resend verification email:', {
        userId: user.id,
        email: user.email
      })

      return NextResponse.json({
        success: false,
        error: 'Failed to send verification email. Please try again later.'
      }, { status: 500 })
    }

  } catch (error) {
    console.error('Resend verification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred while sending verification email'
    }, { status: 500 })
  }
}
