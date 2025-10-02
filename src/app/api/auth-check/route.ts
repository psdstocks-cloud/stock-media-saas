import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'

export async function GET(_request: NextRequest) {
  try {
    const session = await auth()
    
    return NextResponse.json({
      authenticated: !!session,
      user: session?.user ? {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name
      } : null,
      session: !!session
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json({
      authenticated: false,
      error: 'Failed to check authentication',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
