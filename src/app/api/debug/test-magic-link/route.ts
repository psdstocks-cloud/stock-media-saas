import { NextRequest, NextResponse } from 'next/server'
import { sendVerificationRequest } from '@/lib/auth/sendVerificationRequest'

export async function POST(request: NextRequest) {
  try {
    console.log('=== Testing Magic Link Email ===')
    
    // Test parameters
    const testEmail = 'psdstockss@gmail.com' // Use verified email
    const testUrl = 'https://stock-media-saas.vercel.app/api/auth/admin/callback/email?callbackUrl=%2Fadmin&token=test-token-123&email=psdstockss%40gmail.com'
    
    console.log('Test email:', testEmail)
    console.log('Test URL:', testUrl)
    console.log('RESEND_API_KEY exists:', !!process.env.RESEND_API_KEY)
    console.log('EMAIL_FROM:', process.env.EMAIL_FROM)
    
    // Test the sendVerificationRequest function
    await sendVerificationRequest({
      identifier: testEmail,
      url: testUrl,
      provider: {
        server: process.env.EMAIL_SERVER,
        from: process.env.EMAIL_FROM || 'Stock Media SaaS <onboarding@resend.dev>'
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Magic link email sent successfully!',
      testEmail,
      testUrl,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('Magic link test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      details: error,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
