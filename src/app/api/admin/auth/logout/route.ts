import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'

export async function POST(_request: NextRequest) {
  try {
    console.log('🚪 Admin Logout API called')
    
    const cookieStore = await cookies()
    
    // Clear all admin cookies
    cookieStore.delete('admin_access_token')
    cookieStore.delete('admin_refresh_token')
    
    console.log('✅ Logout successful - cookies cleared')
    
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('❌ Logout error:', error)
    return NextResponse.json(
      { success: false, error: 'Logout failed' },
      { status: 500 }
    )
  }
}