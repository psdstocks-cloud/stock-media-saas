import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    
    return NextResponse.json({
      authenticated: !!session?.user,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Authentication check failed'
    })
  }
}