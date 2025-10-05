import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 [Auth Me] Checking unified auth status...')
    
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      console.log('ℹ️ [Auth Me] No authentication found')
      return NextResponse.json({
        authenticated: false,
        user: null
      }, { status: 200 }) // Important: Return 200, not 401 for unauthenticated state
    }

    console.log('✅ [Auth Me] User authenticated:', {
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
    }, { status: 200 })

  } catch (error) {
    console.error('❌ [Auth Me] Error:', error)
    return NextResponse.json({
      authenticated: false,
      user: null,
      error: 'Failed to check auth status'
    }, { status: 200 }) // Return 200 even on error to prevent 401s
  }
}
