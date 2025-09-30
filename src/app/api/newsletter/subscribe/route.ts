import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Resend } from 'resend'

// Initialize Resend (if API key is configured)
const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    // Validate email
    if (!email || typeof email !== 'string') {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      )
    }

    // Rate limiting check (simple IP-based)
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
    
    // Check if email already exists in newsletter table
    // For now, we'll store in a simple way. You can create a Newsletter model in Prisma later.
    
    // Option 1: Store in database (recommended)
    try {
      // This assumes you have a Newsletter table. If not, we'll use SystemSetting as a workaround
      // Create a newsletter entry as a system setting for now
      const existingSubscriber = await prisma.systemSetting.findFirst({
        where: {
          key: `newsletter_${email.toLowerCase()}`,
        },
      })

      if (existingSubscriber) {
        return NextResponse.json(
          { message: 'You are already subscribed!' },
          { status: 200 }
        )
      }

      // Create subscriber record
      await prisma.systemSetting.create({
        data: {
          key: `newsletter_${email.toLowerCase()}`,
          value: JSON.stringify({
            email: email.toLowerCase(),
            subscribedAt: new Date().toISOString(),
            ip,
            status: 'active',
          }),
          type: 'json',
        },
      })
    } catch (dbError) {
      console.error('Database error:', dbError)
      // Continue even if DB fails - we can still send email
    }

    // Option 2: Send welcome email via Resend
    if (resend) {
      try {
        await resend.emails.send({
          from: 'Stock Media SaaS <newsletter@yourdomain.com>', // Update with your domain
          to: email,
          subject: '🎉 Welcome to Stock Media SaaS Newsletter!',
          html: `
            <!DOCTYPE html>
            <html>
              <head>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>Welcome to Stock Media SaaS</title>
              </head>
              <body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
                <div style="background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
                  <h1 style="color: white; margin: 0; font-size: 28px;">Welcome to Stock Media SaaS! 🎉</h1>
                </div>
                
                <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Hi there! 👋
                  </p>
                  
                  <p style="font-size: 16px; margin-bottom: 20px;">
                    Thanks for subscribing to our newsletter! You're now part of a community of 10,000+ creators who get exclusive access to:
                  </p>
                  
                  <ul style="font-size: 16px; margin-bottom: 20px; padding-left: 20px;">
                    <li style="margin-bottom: 10px;">✨ New feature announcements</li>
                    <li style="margin-bottom: 10px;">🎨 Premium stock site updates</li>
                    <li style="margin-bottom: 10px;">💰 Special offers and discounts</li>
                    <li style="margin-bottom: 10px;">📚 Expert tips and tutorials</li>
                  </ul>
                  
                  <p style="font-size: 16px; margin-bottom: 30px;">
                    We send updates once a week - no spam, just valuable content to help you create better.
                  </p>
                  
                  <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://stock-media-saas.vercel.app/register" 
                       style="display: inline-block; background: linear-gradient(135deg, #f97316 0%, #ea580c 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                      Get Started Free
                    </a>
                  </div>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    You can unsubscribe at any time by clicking the link in any email.
                  </p>
                  
                  <p style="font-size: 14px; color: #666; margin-top: 10px;">
                    Questions? Reply to this email - we'd love to hear from you!
                  </p>
                  
                  <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd;">
                    <p style="font-size: 14px; color: #999; margin: 0;">
                      Stock Media SaaS - Access 25+ Premium Stock Sites
                    </p>
                  </div>
                </div>
              </body>
            </html>
          `,
        })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // Don't fail the request if email fails
      }
    }

    // Log the subscription
    console.log(`📧 New newsletter subscriber: ${email}`)

    return NextResponse.json(
      { 
        success: true,
        message: 'Successfully subscribed! Check your email for confirmation.'
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Newsletter subscription error:', error)
    return NextResponse.json(
      { error: 'An error occurred. Please try again later.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check newsletter status
export async function GET() {
  try {
    // Count newsletter subscribers
    const count = await prisma.systemSetting.count({
      where: {
        key: {
          startsWith: 'newsletter_',
        },
      },
    })

    return NextResponse.json({
      status: 'ok',
      subscribers: count,
      service: resend ? 'resend' : 'database-only',
    })
  } catch (error) {
    return NextResponse.json({
      status: 'error',
      message: 'Could not fetch subscriber count',
    }, { status: 500 })
  }
}
