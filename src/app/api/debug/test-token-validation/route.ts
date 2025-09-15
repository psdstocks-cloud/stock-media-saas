import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const { token, email } = await request.json()
    
    console.log('🧪 Testing token validation:', { token, email })
    
    // Find the token in the database
    const verificationToken = await prisma.verificationToken.findFirst({
      where: {
        identifier: email,
        token: token
      }
    })
    
    console.log('🔍 Token lookup result:', {
      found: !!verificationToken,
      token: verificationToken?.token ? `${verificationToken.token.substring(0, 10)}...` : 'NONE',
      expires: verificationToken?.expires,
      isExpired: verificationToken ? new Date() > verificationToken.expires : 'N/A',
      timeUntilExpiry: verificationToken ? 
        Math.round((verificationToken.expires.getTime() - new Date().getTime()) / 1000 / 60) : 'N/A'
    })
    
    if (!verificationToken) {
      return NextResponse.json({
        success: false,
        error: 'Token not found in database',
        details: {
          searchedToken: token,
          searchedEmail: email,
          timestamp: new Date().toISOString()
        }
      }, { status: 404 })
    }
    
    if (new Date() > verificationToken.expires) {
      return NextResponse.json({
        success: false,
        error: 'Token has expired',
        details: {
          token: `${verificationToken.token.substring(0, 10)}...`,
          expires: verificationToken.expires,
          isExpired: true,
          timeUntilExpiry: Math.round((verificationToken.expires.getTime() - new Date().getTime()) / 1000 / 60)
        }
      }, { status: 400 })
    }
    
    // Test the admin user lookup
    const adminUser = await prisma.user.findUnique({
      where: { email: email },
      select: { id: true, email: true, role: true, name: true }
    })
    
    if (!adminUser) {
      return NextResponse.json({
        success: false,
        error: 'Admin user not found',
        details: { email }
      }, { status: 404 })
    }
    
    if (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        success: false,
        error: 'User does not have admin role',
        details: { 
          email: adminUser.email,
          role: adminUser.role 
        }
      }, { status: 403 })
    }
    
    return NextResponse.json({
      success: true,
      message: 'Token validation successful',
      data: {
        token: {
          found: true,
          token: `${verificationToken.token.substring(0, 10)}...`,
          expires: verificationToken.expires,
          isExpired: false,
          timeUntilExpiry: Math.round((verificationToken.expires.getTime() - new Date().getTime()) / 1000 / 60)
        },
        adminUser: {
          id: adminUser.id,
          email: adminUser.email,
          role: adminUser.role,
          name: adminUser.name
        }
      },
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
    console.error('❌ Token validation test failed:', error)
    
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
