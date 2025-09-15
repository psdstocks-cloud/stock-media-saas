import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email') || 'psdstockss@gmail.com'
    
    console.log('🔍 Getting full token for email:', email)
    
    // Get the most recent token for the email
    const token = await prisma.verificationToken.findFirst({
      where: { identifier: email },
      orderBy: { expires: 'desc' }
    })
    
    if (!token) {
      return NextResponse.json({
        success: false,
        error: 'No token found for email',
        email
      }, { status: 404 })
    }
    
    return NextResponse.json({
      success: true,
      data: {
        fullToken: token.token,
        identifier: token.identifier,
        expires: token.expires,
        isExpired: new Date() > token.expires,
        timeUntilExpiry: Math.round((token.expires.getTime() - new Date().getTime()) / 1000 / 60)
      }
    }, {
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })

  } catch (error) {
    console.error('Error getting full token:', error)
    
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { 
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache, no-store, must-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0'
      }
    })
  }
}
