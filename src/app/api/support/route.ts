import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import nodemailer from 'nodemailer'

export async function POST(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { subject, category, message, priority, userEmail, userId } = await request.json()

    // Validate required fields
    if (!subject || !category || !message || !priority) {
      return NextResponse.json({ 
        error: 'Missing required fields' 
      }, { status: 400 })
    }

    // Create support ticket in database
    const ticket = await prisma.supportTicket.create({
      data: {
        subject,
        category,
        message,
        priority: priority.toUpperCase(),
        status: 'OPEN',
        userId,
        userEmail: userEmail || session.user.email || '',
        ticketNumber: `ST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
      }
    })

    // Send email notification to support team (optional)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const mailOptions = {
          from: process.env.SMTP_FROM || 'noreply@stockmedia.com',
          to: process.env.SUPPORT_EMAIL || 'support@stockmedia.com',
          subject: `New Support Ticket: ${ticket.ticketNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">New Support Ticket Received</h2>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">Ticket Details</h3>
                <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>Category:</strong> ${ticket.category}</p>
                <p><strong>Priority:</strong> ${ticket.priority}</p>
                <p><strong>User:</strong> ${userEmail || session.user.email}</p>
                <p><strong>User ID:</strong> ${userId}</p>
              </div>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">Message</h3>
                <p style="white-space: pre-wrap;">${ticket.message}</p>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  This ticket was automatically generated from the Stock Media support system.
                </p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(mailOptions)
        console.log('Support email sent successfully')
      } catch (emailError) {
        console.error('Failed to send support email:', emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.log('Email configuration not available, skipping email notification')
    }

    // Send confirmation email to user (optional)
    if (process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          host: process.env.SMTP_HOST,
          port: parseInt(process.env.SMTP_PORT || '587'),
          secure: false,
          auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
          },
        })

        const userMailOptions = {
          from: process.env.SMTP_FROM || 'noreply@stockmedia.com',
          to: userEmail || session.user.email || '',
          subject: `Support Ticket Confirmation: ${ticket.ticketNumber}`,
          html: `
            <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
              <h2 style="color: #667eea;">Support Ticket Received</h2>
              
              <p>Thank you for contacting our support team. We've received your ticket and will get back to you within 24 hours.</p>
              
              <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e293b;">Your Ticket Details</h3>
                <p><strong>Ticket Number:</strong> ${ticket.ticketNumber}</p>
                <p><strong>Subject:</strong> ${ticket.subject}</p>
                <p><strong>Category:</strong> ${ticket.category}</p>
                <p><strong>Priority:</strong> ${ticket.priority}</p>
                <p><strong>Status:</strong> Open</p>
              </div>
              
              <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0;">
                <h3 style="margin: 0 0 10px 0; color: #1e40af;">What happens next?</h3>
                <ul style="color: #1e40af;">
                  <li>Our support team will review your ticket</li>
                  <li>You'll receive a response within 24 hours</li>
                  <li>We'll work with you to resolve your issue</li>
                </ul>
              </div>
              
              <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                <p style="color: #6b7280; font-size: 14px;">
                  If you have any urgent issues, please contact us directly at support@stockmedia.com
                </p>
              </div>
            </div>
          `
        }

        await transporter.sendMail(userMailOptions)
        console.log('User confirmation email sent successfully')
      } catch (emailError) {
        console.error('Failed to send user confirmation email:', emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.log('Email configuration not available, skipping user confirmation email')
    }

    return NextResponse.json({ 
      success: true, 
      ticket: {
        id: ticket.id,
        ticketNumber: ticket.ticketNumber,
        status: ticket.status
      }
    })

  } catch (error) {
    console.error('Error creating support ticket:', error)
    return NextResponse.json({ 
      error: 'Failed to create support ticket' 
    }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    // Get user session
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's support tickets
    const tickets = await prisma.supportTicket.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ tickets })

  } catch (error) {
    console.error('Error fetching support tickets:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch support tickets' 
    }, { status: 500 })
  }
}
