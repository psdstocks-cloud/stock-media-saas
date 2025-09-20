import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ valid: false, error: 'No token found' }, { status: 401 })
    }

    const user = verifyJWT(token)
    
    if (!user) {
      return NextResponse.json({ valid: false, error: 'Invalid token' }, { status: 401 })
    }

    return NextResponse.json({ 
      valid: true, 
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    })

  } catch (error) {
    console.error('Token verification error:', error)
    return NextResponse.json({ valid: false, error: 'Token verification failed' }, { status: 500 })
  }
}
