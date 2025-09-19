import { NextRequest, NextResponse } from 'next/server'
import { generateCSRFToken, checkCSRFRateLimit } from '@/lib/csrf'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    
    // Check rate limit
    const rateLimit = checkCSRFRateLimit(clientIP)
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          error: 'Too many CSRF token requests',
          retryAfter: rateLimit.retryAfter 
        },
        { status: 429 }
      )
    }
    
    // Generate CSRF token
    const token = generateCSRFToken()
    
    return NextResponse.json({ 
      csrfToken: token,
      expiresIn: 900 // 15 minutes in seconds
    })
  } catch (error) {
    console.error('CSRF token generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate CSRF token' },
      { status: 500 }
    )
  }
}
