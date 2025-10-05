import { NextRequest, NextResponse } from 'next/server'
import { getUnifiedAuth } from '@/lib/auth/unified'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    console.log('👤 [Profile API] Checking user authentication...')
    
    const user = await getUnifiedAuth(request)
    
    if (!user) {
      console.log('❌ [Profile API] No authentication found')
      return NextResponse.json({
        success: false,
        error: 'Authentication required'
      }, { status: 401 })
    }

    console.log('✅ [Profile API] User authenticated:', user.email)

    return NextResponse.json({
      success: true,
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
    console.error('❌ [Profile API] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch profile'
    }, { status: 500 })
  }
}