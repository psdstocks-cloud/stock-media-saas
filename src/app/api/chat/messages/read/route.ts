// src/app/api/chat/messages/read/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-user"
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { messageId, userId } = body

    if (!messageId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Update message status to read
    await prisma.messageStatus.updateMany({
      where: {
        messageId,
        userId: session.user.id,
        status: { not: 'READ' }
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    })

    return NextResponse.json({ message: 'Message marked as read' })
  } catch (error) {
    console.error('Error marking message as read:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
