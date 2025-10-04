import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(_request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (accessToken) {
      try {
        const payload = await verifyToken(accessToken)
        
        // Deactivate session
        await prisma.adminSession.update({
          where: { id: payload.sessionId },
          data: { isActive: false },
        })

        // Audit log
        await prisma.adminAuditLog.create({
          data: {
            adminId: payload.sub,
            action: 'LOGOUT',
            resourceType: 'AUTH',
            newValues: JSON.stringify({ success: true }),
            reason: 'Admin logout successful',
          },
        })
      } catch (error) {
        console.error('Logout session cleanup error:', error)
      }
    }

    // Clear cookies
    cookieStore.delete('admin_access_token')
    cookieStore.delete('admin_refresh_token')

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Logout error:', error)
    return NextResponse.json({ success: true }) // Always return success for logout
  }
}
