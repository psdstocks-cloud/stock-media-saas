import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { error: 'No access token' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)

    // Verify session exists and is active
    const session = await prisma.adminSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    })

    if (!session || !session.isActive || session.expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      )
    }

    return NextResponse.json({
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    })
  } catch (error) {
    console.error('Auth check error:', error)
    return NextResponse.json(
      { error: 'Invalid token' },
      { status: 401 }
    )
  }
}
