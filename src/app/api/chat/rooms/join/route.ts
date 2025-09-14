// src/app/api/chat/rooms/join/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, userId } = body

    if (!roomId || !userId) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Check if user is already a participant
    const existingParticipant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    })

    if (existingParticipant) {
      return NextResponse.json({ message: 'Already a participant' })
    }

    // Add user as participant
    await prisma.chatParticipant.create({
      data: {
        roomId,
        userId: session.user.id,
        role: 'USER'
      }
    })

    return NextResponse.json({ message: 'Joined room successfully' })
  } catch (error) {
    console.error('Error joining room:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
