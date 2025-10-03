import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken, signToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const refreshToken = cookieStore.get('admin_refresh_token')?.value

    if (!refreshToken) {
      return NextResponse.json(
        { error: 'No refresh token' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(refreshToken)

    // Verify session exists and is active
    const session = await prisma.adminSession.findUnique({
      where: { id: payload.sessionId },
      include: { user: true },
    })

    if (!session || !session.isActive) {
      return NextResponse.json(
        { error: 'Session expired or invalid' },
        { status: 401 }
      )
    }

    // Generate new access token
    const newAccessToken = await signToken({
      sub: session.user.id,
      email: session.user.email,
      role: session.user.role,
      sessionId: session.id,
    }, 'access')

    // Update session expiry
    const newExpiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes
    await prisma.adminSession.update({
      where: { id: session.id },
      data: { expiresAt: newExpiresAt },
    })

    // Set new access token cookie
    cookieStore.set('admin_access_token', newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/',
    })

    return NextResponse.json({
      success: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        name: session.user.name,
        role: session.user.role,
      },
    })
  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json(
      { error: 'Invalid refresh token' },
      { status: 401 }
    )
  }
}
