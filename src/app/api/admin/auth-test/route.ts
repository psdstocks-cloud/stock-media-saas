import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    console.log('Auth test - Token present:', !!token)
    console.log('Auth test - Token value:', token ? token.substring(0, 20) + '...' : 'none')
    
    if (!token) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'No token found',
        cookies: Object.fromEntries(cookieStore.getAll().map(c => [c.name, c.value]))
      }, { status: 401 })
    }

    const user = verifyJWT(token)
    console.log('Auth test - User:', user)
    
    if (!user) {
      return NextResponse.json({ 
        authenticated: false, 
        error: 'Invalid token' 
      }, { status: 401 })
    }

    return NextResponse.json({ 
      authenticated: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })
  } catch (error) {
    console.error('Auth test error:', error)
    return NextResponse.json({ 
      authenticated: false, 
      error: 'Auth test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
