import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get user's active sessions
    // Note: This is a simplified implementation. In production, you'd want to track sessions
    // in a separate table with proper session management
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        lastLoginAt: true,
        createdAt: true
      }
    })

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // For now, we'll return mock session data
    // In production, implement proper session tracking
    const sessions = [
      {
        id: 'current-session',
        device: 'Chrome on macOS',
        location: 'San Francisco, CA',
        ipAddress: '192.168.1.1',
        lastActive: new Date().toISOString(),
        isCurrent: true,
        userAgent: request.headers.get('user-agent') || 'Unknown'
      },
      {
        id: 'mobile-session',
        device: 'Safari on iOS',
        location: 'New York, NY',
        ipAddress: '192.168.1.2',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        isCurrent: false,
        userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X)'
      }
    ]

    return NextResponse.json({ 
      sessions,
      totalSessions: sessions.length
    })

  } catch (error) {
    console.error('Error fetching user sessions:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch sessions' 
    }, { status: 500 })
  }
}
