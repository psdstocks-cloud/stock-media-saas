import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Auth Me] Checking unified auth status')
    
    const user = await getAuthenticatedUser(request)
    
    if (!user) {
      return NextResponse.json({
        authenticated: false,
        user: null
      })
    }

    console.log('✅ [Auth Me] User found:', {
      email: user.email,
      role: user.role,
      isAdmin: user.isAdmin,
      isUser: user.isUser
    })

    return NextResponse.json({
      authenticated: true,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
        isAdmin: user.isAdmin,
        isUser: user.isUser
      }
    })

  } catch (error) {
    console.error('❌ [Auth Me] Error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Failed to check auth status'
    })
  }
}
