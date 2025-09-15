import { NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function POST() {
  try {
    // Check if RESEND_API_KEY is available
    if (!process.env.RESEND_API_KEY) {
      return NextResponse.json({
        error: 'RESEND_API_KEY not found',
        message: 'Please add RESEND_API_KEY to your Vercel environment variables'
      }, { status: 400 })
    }

    const resend = new Resend(process.env.RESEND_API_KEY)

    // Test email sending
    const { data, error } = await resend.emails.send({
      from: 'Stock Media SaaS <onboarding@resend.dev>',
      to: ['psdstockspay@gmail.com'],
      subject: '🧪 Test Email - Admin Login System',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #667eea;">✅ Email Test Successful!</h2>
          <p>This is a test email to verify that Resend is working correctly.</p>
          <p><strong>Timestamp:</strong> ${new Date().toISOString()}</p>
          <p><strong>Environment:</strong> ${process.env.NODE_ENV}</p>
          <p><strong>Vercel Environment:</strong> ${process.env.VERCEL_ENV}</p>
          <hr style="margin: 20px 0;">
          <p style="color: #666; font-size: 14px;">
            If you received this email, your Resend configuration is working correctly!
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({
        error: 'Failed to send email',
        details: error,
        message: 'Check your Resend API key and domain configuration'
      }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
      messageId: data?.id,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({
      error: 'Test email failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
