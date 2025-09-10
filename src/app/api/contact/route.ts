import { NextRequest, NextResponse } from 'next/server'
import { contactSchema, sanitizeString } from '@/lib/validation'
import { csrfMiddleware } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate CSRF token
    const csrfCheck = csrfMiddleware(request)
    if (!csrfCheck.isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
    
    // Validate form data
    const validatedData = contactSchema.parse(body)
    
    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeString(validatedData.name),
      email: sanitizeString(validatedData.email),
      subject: sanitizeString(validatedData.subject),
      message: sanitizeString(validatedData.message)
    }
    
    // Log the contact form submission (in production, save to database)
    console.log('Contact form submission:', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      subject: sanitizedData.subject,
      message: sanitizedData.message,
      timestamp: new Date().toISOString(),
      ip: request.ip || request.headers.get('x-forwarded-for') || 'unknown'
    })
    
    // In production, you would:
    // 1. Save to database
    // 2. Send email notification
    // 3. Send auto-reply to user
    
    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully' 
    })
  } catch (error: any) {
    console.error('Contact form error:', error)
    
    if (error.errors) {
      return NextResponse.json(
        { 
          error: 'Validation failed',
          details: error.errors.map((err: any) => ({
            field: err.path[0],
            message: err.message
          }))
        },
        { status: 400 }
      )
    }
    
    return NextResponse.json(
      { error: 'Failed to process contact form' },
      { status: 500 }
    )
  }
}
