import { NextRequest, NextResponse } from 'next/server'
import { contactSchema, sanitizeString } from '@/lib/validation'
import { csrfMiddleware } from '@/lib/csrf'

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    
    // Validate CSRF token
    const csrfCheck = csrfMiddleware(request)
    if (!csrfCheck.isValid) {
      return NextResponse.json(
        { error: 'Invalid CSRF token' },
        { status: 403 }
      )
    }
    
    // Extract form data
    const body = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      department: formData.get('department') as string,
      subject: formData.get('subject') as string,
      priority: formData.get('priority') as string,
      orderReference: formData.get('orderReference') as string || undefined,
      message: formData.get('message') as string
    }
    
    // Validate form data
    const validatedData = contactSchema.parse(body)
    
    // Sanitize all inputs
    const sanitizedData = {
      name: sanitizeString(validatedData.name),
      email: sanitizeString(validatedData.email),
      department: validatedData.department,
      subject: sanitizeString(validatedData.subject),
      priority: validatedData.priority,
      orderReference: validatedData.orderReference ? sanitizeString(validatedData.orderReference) : undefined,
      message: sanitizeString(validatedData.message)
    }
    
    // Handle file attachments
    const attachments: { name: string; size: number; type: string }[] = []
    for (const [key, value] of formData.entries()) {
      if (key.startsWith('attachment_') && value instanceof File) {
        attachments.push({
          name: value.name,
          size: value.size,
          type: value.type
        })
        // In production, you would save the file to cloud storage or local filesystem
        console.log(`Attachment: ${value.name} (${value.size} bytes, ${value.type})`)
      }
    }

    // Log the contact form submission (in production, save to database)
    console.log('Contact form submission:', {
      name: sanitizedData.name,
      email: sanitizedData.email,
      department: sanitizedData.department,
      subject: sanitizedData.subject,
      priority: sanitizedData.priority,
      orderReference: sanitizedData.orderReference,
      message: sanitizedData.message,
      attachments: attachments,
      timestamp: new Date().toISOString(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
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
