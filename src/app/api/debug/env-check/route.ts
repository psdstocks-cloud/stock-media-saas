import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const envCheck = {
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
        value: process.env.DATABASE_URL ? '***HIDDEN***' : 'NOT_SET'
      },
      RESEND_API_KEY: {
        exists: !!process.env.RESEND_API_KEY,
        value: process.env.RESEND_API_KEY ? '***HIDDEN***' : 'NOT_SET'
      },
      EMAIL_FROM: {
        exists: !!process.env.EMAIL_FROM,
        value: process.env.EMAIL_FROM || 'NOT_SET'
      },
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

    return NextResponse.json({
      message: 'Environment variables check',
      environment: process.env.NODE_ENV,
      vercelEnv: process.env.VERCEL_ENV,
      variables: envCheck,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Failed to check environment variables',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
