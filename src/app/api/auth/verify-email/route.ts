import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyEmailSchema = z.object({
  token: z.string().min(1, 'Token is required')
})

// Common verification logic
async function verifyEmailToken(token: string) {
  // Find the verification token
  const verificationToken = await prisma.emailVerificationToken.findUnique({
    where: { token },
    include: { user: true }
  })

  if (!verificationToken) {
    console.warn('Email verification attempt with invalid token:', { token })
    return {
      success: false,
      error: 'Invalid or expired verification token'
    }
  }

  // Check if token is already used
  if (verificationToken.used) {
    console.warn('Email verification attempt with used token:', { 
      token, 
      userId: verificationToken.userId,
      email: verificationToken.email 
    })
    return {
      success: false,
      error: 'This verification link has already been used'
    }
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
    
    return {
      success: false,
      error: 'Verification token has expired. Please request a new verification email.'
    }
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
    
    return {
      success: true,
      message: 'Email is already verified',
      alreadyVerified: true
    }
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

  return {
    success: true,
    message: 'Email verified successfully! You can now log in to your account.',
    user: {
      id: verificationToken.user.id,
      email: verificationToken.user.email,
      name: verificationToken.user.name,
      emailVerified: new Date().toISOString()
    }
  }
}

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

    // Use common verification logic
    const result = await verifyEmailToken(token)

    if (!result.success) {
      return NextResponse.json(result, { status: 400 })
    }

    return NextResponse.json(result)

  } catch (error) {
    console.error('Email verification API error:', error)
    return NextResponse.json({
      success: false,
      error: 'An error occurred during email verification'
    }, { status: 500 })
  }
}

// GET endpoint for direct link verification (from email links)
// Fixed TypeScript error - using common verification logic
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.redirect(new URL('/login?error=Verification token is required', request.url))
    }

    // Use common verification logic
    const result = await verifyEmailToken(token)

    if (result.success) {
      // Redirect to login page with success message
      return NextResponse.redirect(new URL('/login?verified=true', request.url))
    } else {
      // Redirect to login page with error message
      return NextResponse.redirect(new URL(`/login?error=${encodeURIComponent(result.error)}`, request.url))
    }

  } catch (error) {
    console.error('Email verification GET API error:', error)
    return NextResponse.redirect(new URL('/login?error=Verification failed', request.url))
  }
}
