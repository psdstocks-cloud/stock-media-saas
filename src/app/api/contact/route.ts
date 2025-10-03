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

    // Create support ticket in database
    const { prisma } = await import('@/lib/prisma')
    
    // Find or create user
    let user = await prisma.user.findUnique({
      where: { email: sanitizedData.email }
    })

    if (!user) {
      // Create user if doesn't exist
      user = await prisma.user.create({
        data: {
          email: sanitizedData.email,
          name: sanitizedData.name,
          role: 'USER'
        }
      })
    }
    
    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`
    
    // Calculate SLA due date based on priority
    const slaDueDate = new Date()
    switch (sanitizedData.priority) {
      case 'urgent':
        slaDueDate.setHours(slaDueDate.getHours() + 4) // 4 hours
        break
      case 'high':
        slaDueDate.setHours(slaDueDate.getHours() + 12) // 12 hours
        break
      case 'medium':
        slaDueDate.setDate(slaDueDate.getDate() + 1) // 1 day
        break
      case 'low':
        slaDueDate.setDate(slaDueDate.getDate() + 3) // 3 days
        break
      default:
        slaDueDate.setDate(slaDueDate.getDate() + 1) // 1 day
    }
    
    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject: sanitizedData.subject,
        category: sanitizedData.department, // Using department as category
        department: sanitizedData.department,
        message: sanitizedData.message,
        priority: sanitizedData.priority.toUpperCase(),
        status: 'OPEN',
        userId: user.id,
        userEmail: sanitizedData.email,
        userName: sanitizedData.name,
        orderReference: sanitizedData.orderReference,
        attachments: attachments.length > 0 ? {
          files: attachments.map(att => ({
            name: att.name,
            size: att.size,
            type: att.type
          }))
        } : undefined,
        slaDueDate
      }
    })

    // Log the contact form submission
    console.log('Contact form submission:', {
      ticketId: ticket.id,
      ticketNumber: ticket.ticketNumber,
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
    
    // TODO: In production, you would:
    // 1. Send email notification to support team
    // 2. Send auto-reply to user with ticket number
    // 3. Create webhook for external integrations
    
    return NextResponse.json({ 
      success: true,
      message: 'Message sent successfully',
      ticketNumber: ticket.ticketNumber
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
