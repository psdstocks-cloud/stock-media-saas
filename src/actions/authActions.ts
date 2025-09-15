'use server'

import { signIn, signOut } from '@/lib/auth/adminAuth'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

// Rate limiting (simple in-memory implementation)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

function checkRateLimit(key: string, maxRequests: number, windowMs: number): boolean {
  const now = Date.now()
  const record = rateLimitMap.get(key)
  
  if (!record || now > record.resetTime) {
    rateLimitMap.set(key, { count: 1, resetTime: now + windowMs })
    return true
  }
  
  if (record.count >= maxRequests) {
    return false
  }
  
  record.count++
  return true
}

// Email validation schema
const emailSchema = z.string().email('Please enter a valid email address')

export async function adminLogin(
  previousState: { success: boolean; message?: string } | undefined,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    const email = formData.get('email') as string

    // Validate email input
    const validationResult = emailSchema.safeParse(email)
    if (!validationResult.success) {
      return {
        success: false,
        message: 'Please enter a valid email address.'
      }
    }

    const trimmedEmail = validationResult.data.toLowerCase()

    // Rate limiting (3 requests per minute per IP)
    const clientIP = 'unknown' // In production, get from headers
    const rateLimitKey = `admin-login:${clientIP}`
    
    if (!checkRateLimit(rateLimitKey, 3, 60000)) {
      return {
        success: false,
        message: 'Too many login attempts. Please try again in a minute.'
      }
    }

    // Check if user exists and has admin role
    const user = await prisma.user.findUnique({
      where: { email: trimmedEmail },
      select: { 
        id: true, 
        email: true, 
        role: true,
        name: true 
      }
    })

    // Security: Always return success message to prevent email enumeration
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      try {
        // Use NextAuth's signIn with email provider
        await signIn('email', { 
          email: trimmedEmail, 
          redirect: false 
        })

        console.log('Admin magic link sent successfully:', {
          email: trimmedEmail,
          userId: user.id,
          role: user.role,
          timestamp: new Date().toISOString()
        })

        return {
          success: true,
          message: 'Check your inbox for the login link.'
        }
      } catch (signInError) {
        console.error('Failed to send admin magic link:', {
          email: trimmedEmail,
          error: signInError,
          timestamp: new Date().toISOString()
        })

        return {
          success: true,
          message: 'Check your inbox for the login link.'
        }
      }
    } else {
      // Log attempted access by non-admin
      console.warn('Non-admin email attempted admin login:', {
        email: trimmedEmail,
        userExists: !!user,
        userRole: user?.role,
        timestamp: new Date().toISOString()
      })

      // Return success message to prevent email enumeration
      return {
        success: true,
        message: 'Check your inbox for the login link.'
      }
    }

  } catch (error) {
    console.error('Admin login action error:', {
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    })

    return {
      success: false,
      message: 'An unexpected error occurred. Please try again.'
    }
  }
}

export async function adminSignOut() {
  try {
    await signOut({ redirectTo: '/admin/login' })
  } catch (error) {
    console.error('Admin sign out error:', error)
    throw new Error('Failed to sign out')
  }
}
