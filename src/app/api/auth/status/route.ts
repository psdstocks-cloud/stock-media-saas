import { NextRequest, NextResponse } from 'next/server'
import { verifyUserAuth } from '@/lib/auth/user'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Auth status check')
    
    const user = await verifyUserAuth(request)
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
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
    console.error('❌ Auth status error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Failed to check auth status'
    })
  }
}
