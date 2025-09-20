import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
})

export async function POST(request: NextRequest) {
  try {
    console.log('Email verification API called')
    const body = await request.json()
    
    // Validate input
    const validation = verifyEmailSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        error: 'Invalid token format',
        details: validation.error.errors
      }, { status: 400 })
    }

    const { token } = validation.data

    // Find the verification token
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!verificationToken) {
      console.warn('Email verification attempt with invalid token:', { token })
      return NextResponse.json({
        success: false,
        error: 'Invalid or expired verification token'
      }, { status: 400 })
    }

    // Check if token is already used
    if (verificationToken.used) {
      console.warn('Email verification attempt with used token:', { 
        token, 
        userId: verificationToken.userId,
        email: verificationToken.email 
      })
      return NextResponse.json({
        success: false,
        error: 'This verification link has already been used'
      }, { status: 400 })
    }

    // Check if token is expired
    if (verificationToken.expiresAt < new Date()) {
      console.warn('Email verification attempt with expired token:', { 
        token, 
        userId: verificationToken.userId,
        email: verificationToken.email,
        expiresAt: verificationToken.expiresAt
      })
      
      // Clean up expired token
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json({
        success: false,
        error: 'Verification token has expired. Please request a new verification email.'
      }, { status: 400 })
    }

    // Check if user is already verified
    if (verificationToken.user.emailVerified) {
      console.log('Email verification attempt for already verified user:', { 
        userId: verificationToken.userId,
        email: verificationToken.email 
      })
      
      // Clean up the token since user is already verified
      await prisma.emailVerificationToken.delete({
        where: { id: verificationToken.id }
      })
      
      return NextResponse.json({
        success: true,
        message: 'Email is already verified',
        alreadyVerified: true
      })
    }

    // Verify the user's email
    await prisma.$transaction(async (tx) => {
      // Update user's email verification status
      await tx.user.update({
        where: { id: verificationToken.userId },
        data: { 
          emailVerified: new Date(),
          updatedAt: new Date()
        }
      })

      // Mark the token as used
      await tx.emailVerificationToken.update({
        where: { id: verificationToken.id },
        data: { 
          used: true,
          updatedAt: new Date()
        }
      })
    })

    console.log('Email verification successful:', {
      userId: verificationToken.userId,
      email: verificationToken.email,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully! You can now log in to your account.',
      user: {
        id: verificationToken.user.id,
        email: verificationToken.user.email,
        name: verificationToken.user.name,
        emailVerified: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Email verification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred during email verification'
    }, { status: 500 })
  }
}

// GET endpoint for direct link verification (from email links)
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'Verification token is required'
      }, { status: 400 })
    }

    // Use the same logic as POST but return a redirect response for GET
    const response = await POST(request.clone())
    const data = await response.json()

    if (data.success) {
      // Redirect to login page with success message
      return NextResponse.redirect(new URL('/login?verified=true', request.url))
    } else {
      // Redirect to login page with error message
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(data.error)}`, request.url))
    }

  } catch (error) {
    console.error('Email verification GET API error:', error)
    return NextResponse.redirect(new URL('/login?error=Verification failed', request.url))
  }
}
