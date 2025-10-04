import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🔐 Admin Permissions API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Return default admin permissions
    const permissions = {
      'users.view': true,
      'users.edit': true,
      'orders.view': true,
      'orders.manage': true,
      'settings.write': true,
      'platforms.manage': true,
      'website_status.manage': true,
      'tickets.manage': true,
      'analytics.view': true,
    }

    console.log('✅ Permissions retrieved for:', user.email)

    return NextResponse.json({
      success: true,
      permissions
    })
  } catch (error) {
    console.error('❌ Permissions error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to get permissions' },
      { status: 500 }
    )
  }
}