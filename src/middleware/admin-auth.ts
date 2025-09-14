// src/middleware/admin-auth.ts
// Enhanced admin authentication middleware

import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function adminAuthMiddleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Only apply to admin routes
  if (!pathname.startsWith('/admin')) {
    return NextResponse.next()
  }

  // Skip admin login page
  if (pathname === '/admin/login') {
    return NextResponse.next()
  }

  try {
    // Get the JWT token
    const token = await getToken({ 
      req: request, 
      secret: process.env.NEXTAUTH_SECRET 
    })

    // Check if user is authenticated
    if (!token) {
      return NextResponse.redirect(new URL('/admin/login', request.url))
    }

    // Check if user has admin role
    if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/dashboard', request.url))
    }

    // Add security headers for admin routes
    const response = NextResponse.next()
    
    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')
    
    // Cache control for admin pages
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate')
    response.headers.set('Pragma', 'no-cache')
    response.headers.set('Expires', '0')

    return response
  } catch (error) {
    console.error('Admin auth middleware error:', error)
    return NextResponse.redirect(new URL('/admin/login', request.url))
  }
}

// Rate limiting for admin login attempts
const loginAttempts = new Map<string, { count: number; lastAttempt: number }>()

export function checkLoginRateLimit(ip: string): boolean {
  const now = Date.now()
  const attempts = loginAttempts.get(ip)
  
  if (!attempts) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Reset if more than 15 minutes have passed
  if (now - attempts.lastAttempt > 15 * 60 * 1000) {
    loginAttempts.set(ip, { count: 1, lastAttempt: now })
    return true
  }

  // Allow up to 5 attempts per 15 minutes
  if (attempts.count >= 5) {
    return false
  }

  attempts.count++
  attempts.lastAttempt = now
  return true
}

// Clean up old attempts periodically
setInterval(() => {
  const now = Date.now()
  for (const [ip, attempts] of loginAttempts.entries()) {
    if (now - attempts.lastAttempt > 15 * 60 * 1000) {
      loginAttempts.delete(ip)
    }
  }
}, 5 * 60 * 1000) // Clean up every 5 minutes
