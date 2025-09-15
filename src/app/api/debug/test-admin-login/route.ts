import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { signIn } from '@/lib/auth/adminAuth'

export async function POST(request: NextRequest) {
  try {
    console.log('🧪 DEBUG: Testing complete admin login flow...')
    
    const testEmail = 'psdstockss@gmail.com'
    
    // Step 1: Check if admin user exists
    console.log('🔍 Step 1: Checking admin user in database...')
    const adminUser = await prisma.user.findUnique({
      where: { email: testEmail },
      select: { id: true, email: true, role: true, name: true }
    })
    
    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'Admin user not found in database',
        step: 'user_lookup'
      }, { status: 400 })
    }
    
    console.log('✅ Admin user found:', adminUser)
    
    // Step 2: Test email provider directly (simulate what NextAuth does)
    console.log('🔍 Step 2: Testing email provider directly...')
    try {
      // Simulate what NextAuth's EmailProvider does internally
      const { sendVerificationRequest } = await import('@/lib/auth/sendVerificationRequest')
      
      // Create a verification token manually (like NextAuth does)
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
      const expires = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes
      
      // Save token to database
      await prisma.verificationToken.create({
        data: {
          identifier: testEmail,
          token: token,
          expires: expires
        }
      })
      
      console.log('✅ Verification token created manually')
    } catch (signInError) {
      console.error('❌ Token creation failed:', signInError)
      return NextResponse.json({
        success: false,
        error: 'Token creation failed',
        details: signInError instanceof Error ? signInError.message : 'Unknown error',
        step: 'token_creation'
      }, { status: 500 })
    }
    
    // Step 3: Check if verification token was created
    console.log('🔍 Step 3: Checking verification token creation...')
    
    const verificationToken = await prisma.verificationToken.findFirst({
      where: { identifier: testEmail },
      orderBy: { expires: 'desc' }
    })
    
    if (!verificationToken) {
      return NextResponse.json({
        success: false,
        error: 'Verification token was not created',
        step: 'token_creation'
      }, { status: 500 })
    }
    
    console.log('✅ Verification token found:', {
      token: `${verificationToken.token.substring(0, 10)}...`,
      expires: verificationToken.expires,
      isExpired: new Date() > verificationToken.expires
    })
    
    // Step 4: Test email sending
    console.log('🔍 Step 4: Testing email sending...')
    try {
      const { sendVerificationRequest } = await import('@/lib/auth/sendVerificationRequest')
      
      await sendVerificationRequest({
        identifier: testEmail,
        url: `https://stock-media-saas.vercel.app/api/auth/admin/callback/email?callbackUrl=%2Fadmin&token=${verificationToken.token}&email=${encodeURIComponent(testEmail)}`,
        provider: {
          server: {
            host: 'smtp.resend.com',
            port: 587,
            auth: {
              user: 'resend',
              pass: process.env.RESEND_API_KEY,
            },
          },
          from: process.env.EMAIL_FROM || 'Stock Media SaaS <onboarding@resend.dev>'
        }
      })
      
      console.log('✅ Email sent successfully')
    } catch (emailError) {
      console.error('❌ Email sending failed:', emailError)
      return NextResponse.json({
        success: false,
        error: 'Email sending failed',
        details: emailError instanceof Error ? emailError.message : 'Unknown error',
        step: 'email_sending'
      }, { status: 500 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Complete admin login flow test successful!',
      data: {
        adminUser,
        verificationToken: {
          token: `${verificationToken.token.substring(0, 10)}...`,
          expires: verificationToken.expires,
          isExpired: new Date() > verificationToken.expires
        }
      },
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('❌ Admin login test failed:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      step: 'general',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
