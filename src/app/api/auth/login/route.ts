import { NextRequest, NextResponse } from 'next/server'
import { compare } from 'bcryptjs'
import { generateToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  try {
    console.log('🔐 Unified login API called')
    
    const { email, password } = await request.json()

    if (!email || !password) {
      return NextResponse.json({
        success: false,
        error: 'Email and password are required'
      }, { status: 400 })
    }

    // Check if user exists
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase().trim() }
    })

    // Create demo user if logging in with demo credentials
    if (!user && email === 'demo@example.com' && password === 'demo123') {
      console.log('🎭 Creating demo user')
      user = await prisma.user.create({
        data: {
          email: 'demo@example.com',
          name: 'Demo User',
          password: await import('bcryptjs').then(bcrypt => bcrypt.hash('demo123', 12)),
          emailVerified: new Date(),
          role: 'USER'
        }
      })
      
      // Create points balance for demo user
      await prisma.pointsBalance.create({
        data: {
          userId: user.id,
          currentPoints: 100,
          totalPurchased: 100,
          totalUsed: 0
        }
      })
    }

    // Create admin user if logging in with admin credentials
    if (!user && email === 'admin@stockmedia.com' && password === 'admin123') {
      console.log('👑 Creating admin user')
      user = await prisma.user.create({
        data: {
          email: 'admin@stockmedia.com',
          name: 'System Administrator',
          password: await import('bcryptjs').then(bcrypt => bcrypt.hash('admin123', 12)),
          emailVerified: new Date(),
          role: 'SUPER_ADMIN'
        }
      })
    }

    if (!user) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Verify password
    if (!user.password) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }
    
    const isValidPassword = await compare(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json({
        success: false,
        error: 'Invalid email or password'
      }, { status: 401 })
    }

    // Generate access token
    const accessToken = await generateToken({
      sub: user.id,
      email: user.email,
      name: user.name,
      role: user.role
    })

    // Set HTTP-only cookie - USE SINGLE COOKIE NAME
    const response = NextResponse.json({
      success: true,
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.role === 'ADMIN' || user.role === 'SUPER_ADMIN',
        isUser: true
      }
    })

    // Clear any old cookies first
    response.cookies.set('admin_access_token', '', { maxAge: 0, path: '/' })
    response.cookies.set('user_access_token', '', { maxAge: 0, path: '/' })

    // Set the new unified cookie
    response.cookies.set('user_access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })

    console.log('✅ Unified login successful:', user.email, 'Role:', user.role)
    return response

  } catch (error) {
    console.error('❌ User login error:', error)
    return NextResponse.json({
      success: false,
      error: 'Internal server error'
    }, { status: 500 })
  }
}
