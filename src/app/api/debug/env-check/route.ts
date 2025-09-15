import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Checking environment variables...')
    
    const envCheck = {
      // Required variables
      NEXTAUTH_SECRET: {
        exists: !!process.env.NEXTAUTH_SECRET,
        length: process.env.NEXTAUTH_SECRET?.length || 0,
        value: process.env.NEXTAUTH_SECRET ? '***HIDDEN***' : 'NOT_SET'
      },
      NEXTAUTH_URL: {
        exists: !!process.env.NEXTAUTH_URL,
        value: process.env.NEXTAUTH_URL || 'NOT_SET'
      },
      DATABASE_URL: {
        exists: !!process.env.DATABASE_URL,
        value: process.env.DATABASE_URL ? '***HIDDEN***' : 'NOT_SET',
        isValid: process.env.DATABASE_URL?.includes('postgresql://') || false
      },
      
      // Email configuration
      RESEND_API_KEY: {
        exists: !!process.env.RESEND_API_KEY,
        length: process.env.RESEND_API_KEY?.length || 0,
        value: process.env.RESEND_API_KEY ? '***HIDDEN***' : 'NOT_SET'
      },
      EMAIL_FROM: {
        exists: !!process.env.EMAIL_FROM,
        value: process.env.EMAIL_FROM || 'NOT_SET'
      },
      EMAIL_SERVER: {
        exists: !!process.env.EMAIL_SERVER,
        value: process.env.EMAIL_SERVER || 'NOT_SET'
      },
      
      // Optional variables
      EMAIL_SERVER_HOST: {
        exists: !!process.env.EMAIL_SERVER_HOST,
        value: process.env.EMAIL_SERVER_HOST || 'NOT_SET'
      },
      EMAIL_SERVER_PORT: {
        exists: !!process.env.EMAIL_SERVER_PORT,
        value: process.env.EMAIL_SERVER_PORT || 'NOT_SET'
      },
      EMAIL_SERVER_USER: {
        exists: !!process.env.EMAIL_SERVER_USER,
        value: process.env.EMAIL_SERVER_USER || 'NOT_SET'
      },
      EMAIL_SERVER_PASSWORD: {
        exists: !!process.env.EMAIL_SERVER_PASSWORD,
        value: process.env.EMAIL_SERVER_PASSWORD ? '***HIDDEN***' : 'NOT_SET'
      }
    }

    // Check for critical issues
    const issues = []
    
    if (!envCheck.NEXTAUTH_SECRET.exists) {
      issues.push('NEXTAUTH_SECRET is missing - this will cause authentication failures')
    }
    
    if (!envCheck.NEXTAUTH_URL.exists) {
      issues.push('NEXTAUTH_URL is missing - this will cause redirect issues')
    }
    
    if (!envCheck.DATABASE_URL.exists) {
      issues.push('DATABASE_URL is missing - this will cause database connection failures')
    }
    
    if (!envCheck.RESEND_API_KEY.exists) {
      issues.push('RESEND_API_KEY is missing - this will cause email sending failures')
    }

    console.log('🔍 Environment check complete:', {
      issues: issues.length,
      criticalIssues: issues.filter(issue => issue.includes('NEXTAUTH') || issue.includes('DATABASE')).length
    })

    return NextResponse.json({
      success: true,
      environment: envCheck,
      issues,
      criticalIssues: issues.filter(issue => 
        issue.includes('NEXTAUTH') || 
        issue.includes('DATABASE') || 
        issue.includes('RESEND')
      ),
      timestamp: new Date().toISOString()
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error checking environment variables:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}