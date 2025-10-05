import { NextRequest, NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(_request: NextRequest) {
  try {
    console.log('🚪 [Logout] Unified logout called')

    const response = NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    })

    // Clear ALL possible authentication cookies
    const cookiesToClear = ['user_access_token', 'admin_access_token']
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set(cookieName, '', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 0, // Expire immediately
        path: '/'
      })
    })

    console.log('✅ [Logout] All cookies cleared')
    return response

  } catch (error) {
    console.error('❌ [Logout] Error:', error)
    return NextResponse.json({
      success: false,
      error: 'Logout failed'
    }, { status: 500 })
  }
}
