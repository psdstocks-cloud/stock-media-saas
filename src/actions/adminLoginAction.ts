'use server'

import { prisma } from '@/lib/prisma'
import { sendVerificationRequest } from '@/lib/auth/sendVerificationRequest'

// Simple in-memory rate limiting (for production, use Redis)
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

export async function authenticateAdmin(
  previousState: { success: boolean; message?: string } | undefined,
  formData: FormData
): Promise<{ success: boolean; message?: string }> {
  try {
    // --- DEBUGGING LOGS ---
    console.log('--- Admin Login Action Triggered ---')
    console.log('NEXTAUTH_URL:', process.env.NEXTAUTH_URL)
    console.log('Has NEXTAUTH_SECRET:', !!process.env.NEXTAUTH_SECRET)
    console.log('NEXTAUTH_SECRET length:', process.env.NEXTAUTH_SECRET?.length || 0)
    console.log('DATABASE_URL exists:', !!process.env.DATABASE_URL)
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
    console.log('------------------------------------')

    const email = formData.get('email') as string

    // Input validation
    if (!email || typeof email !== 'string') {
      return {
        success: false,
        message: 'Please provide a valid email address.'
      }
    }

    const trimmedEmail = email.trim().toLowerCase()

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(trimmedEmail)) {
      return {
        success: false,
        message: 'Please provide a valid email address.'
      }
    }

    // Get client IP for rate limiting (simplified for Vercel)
    const clientIP = 'unknown' // In production, you'd get this from headers

    // Check rate limits
    const ipKey = `ip:${clientIP}`
    const emailKey = `email:${trimmedEmail}`
    
    if (!checkRateLimit(ipKey, 5, 60000) || !checkRateLimit(emailKey, 3, 3600000)) {
      console.warn('Rate limit exceeded for admin login:', {
        email: trimmedEmail,
        ip: clientIP,
        timestamp: new Date().toISOString()
      })
      
      // Return generic error to prevent email enumeration
      return {
        success: true,
        message: 'Check your inbox for the login link.'
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
    // Only send email if user is actually an admin
    if (user && (user.role === 'ADMIN' || user.role === 'SUPER_ADMIN')) {
      try {
        // Generate a magic link URL (simplified approach)
        const baseUrl = process.env.NEXTAUTH_URL || 'https://stock-media-saas-e4k2gb720-psdstocks-projects.vercel.app'
        const magicLink = `${baseUrl}/api/auth/admin/signin?email=${encodeURIComponent(trimmedEmail)}&callbackUrl=${encodeURIComponent('/admin')}`
        
        // Send magic link directly using our email function
        await sendVerificationRequest({
          identifier: trimmedEmail,
          url: magicLink,
          provider: {
            server: {
              host: process.env.EMAIL_SERVER_HOST,
              port: process.env.EMAIL_SERVER_PORT,
              auth: {
                user: process.env.EMAIL_SERVER_USER,
                pass: process.env.EMAIL_SERVER_PASSWORD,
              },
            },
            from: process.env.EMAIL_FROM || 'Stock Media SaaS <psdstockspay@gmail.com>'
          }
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
      } catch (emailError) {
        console.error('Failed to send admin magic link:', {
          email: trimmedEmail,
          error: emailError,
          timestamp: new Date().toISOString()
        })

        // Still return success to prevent email enumeration
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

    // Return generic success message to prevent information leakage
    return {
      success: true,
      message: 'Check your inbox for the login link.'
    }
  }
}
