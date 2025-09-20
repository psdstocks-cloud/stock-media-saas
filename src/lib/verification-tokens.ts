import { prisma } from '@/lib/prisma'
import { sendEmailVerificationEmail } from '@/lib/email'
import crypto from 'crypto'

/**
 * Generate a secure random token for email verification
 */
export function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

/**
 * Create and save an email verification token for a user
 */
export async function createEmailVerificationToken(
  userId: string,
  email: string
): Promise<string> {
  const token = generateVerificationToken()
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

  // Clean up any existing unused tokens for this user
  await prisma.emailVerificationToken.deleteMany({
    where: {
      userId,
      used: false
    }
  })

  // Create the new token
  await prisma.emailVerificationToken.create({
    data: {
      token,
      userId,
      email,
      expiresAt
    }
  })

  return token
}

/**
 * Send email verification email to user
 */
export async function sendVerificationEmail(
  userId: string,
  email: string,
  name?: string
): Promise<boolean> {
  try {
    // Create verification token
    const token = await createEmailVerificationToken(userId, email)
    
    // Send verification email
    await sendEmailVerificationEmail(email, token, name || '')
    
    console.log('Verification email sent successfully:', {
      userId,
      email,
      token: token.substring(0, 10) + '...'
    })
    
    return true
  } catch (error) {
    console.error('Failed to send verification email:', {
      userId,
      email,
      error: error instanceof Error ? error.message : 'Unknown error'
    })
    return false
  }
}

/**
 * Clean up expired verification tokens (can be run as a cron job)
 */
export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.emailVerificationToken.deleteMany({
    where: {
      OR: [
        { expiresAt: { lt: new Date() } },
        { used: true }
      ]
    }
  })

  console.log(`Cleaned up ${result.count} expired verification tokens`)
  return result.count
}
