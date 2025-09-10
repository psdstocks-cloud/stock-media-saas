import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password, confirmPassword } = await request.json()

    // Validate input
    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      )
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { error: 'Passwords do not match' },
        { status: 400 }
      )
    }

    // Validate password strength
    const passwordValidation = validatePassword(password)
    if (!passwordValidation.isValid) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters with uppercase, lowercase, numbers, and special characters' },
        { status: 400 }
      )
    }

    // Find the reset token
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
      include: { user: true }
    })

    if (!resetToken) {
      return NextResponse.json(
        { error: 'Invalid reset token' },
        { status: 400 }
      )
    }

    // Check if token is expired
    if (resetToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.passwordResetToken.delete({
        where: { id: resetToken.id }
      })
      
      return NextResponse.json(
        { error: 'Reset token has expired' },
        { status: 400 }
      )
    }

    // Check if token is already used
    if (resetToken.used) {
      return NextResponse.json(
        { error: 'Reset token has already been used' },
        { status: 400 }
      )
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(password, 12)

    // Update user password and mark token as used
    await prisma.$transaction(async (tx) => {
      // Update user password
      await tx.user.update({
        where: { id: resetToken.userId },
        data: { password: hashedPassword }
      })

      // Mark token as used
      await tx.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { used: true }
      })

      // Clean up any other unused tokens for this user
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: resetToken.userId,
          used: false
        }
      })
    })

    console.log(`Password reset successful for user ${resetToken.userId}`)

    return NextResponse.json({
      success: true,
      message: 'Password has been successfully reset'
    })

  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: 'An error occurred while resetting the password' },
      { status: 500 }
    )
  }
}

// Password validation function
function validatePassword(password: string) {
  const minLength = password.length >= 8
  const hasUpperCase = /[A-Z]/.test(password)
  const hasLowerCase = /[a-z]/.test(password)
  const hasNumbers = /\d/.test(password)
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password)
  
  return {
    isValid: minLength && hasUpperCase && hasLowerCase && hasNumbers && hasSpecialChar,
    minLength,
    hasUpperCase,
    hasLowerCase,
    hasNumbers,
    hasSpecialChar
  }
}
