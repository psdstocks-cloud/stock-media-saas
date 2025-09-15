// src/app/api/chat/messages/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth-user"
import { prisma } from '@/lib/prisma'

// GET /api/chat/messages - Get messages for a room
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    console.log('Messages API - Session:', session)
    
    if (!session?.user?.id) {
      console.log('Messages API - No session or user ID')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const lastMessageId = searchParams.get('lastMessageId')

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Verify user is participant in the room
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages
    const whereClause: any = {
      roomId
    }

    if (lastMessageId) {
      whereClause.id = {
        gt: lastMessageId
      }
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        statuses: {
          where: {
            userId: session.user.id
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: 50 // Limit to last 50 messages
    })

    return NextResponse.json({ messages })
  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST /api/chat/messages - Send a message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { roomId, userId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId } = body

    if (!roomId || !userId || !content) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Verify user is participant in the room
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        roomId,
        userId: session.user.id,
        content,
        type: type as any,
        fileUrl,
        fileName,
        fileSize,
        replyToId
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            role: true
          }
        },
        replyTo: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        }
      }
    })

    // Update room's last message time
    await prisma.chatRoom.update({
      where: { id: roomId },
      data: { lastMessageAt: new Date() }
    })

    // Create message status for all participants
    const participants = await prisma.chatParticipant.findMany({
      where: { roomId },
      select: { userId: true }
    })

    const messageStatuses = participants.map(p => ({
      messageId: message.id,
      userId: p.userId,
      status: p.userId === session.user.id ? 'SENT' : 'DELIVERED'
    }))

    await prisma.messageStatus.createMany({
      data: messageStatuses
    })

    // Add statuses to message
    const messageWithStatuses = {
      ...message,
      statuses: messageStatuses
    }

    return NextResponse.json({ message: messageWithStatuses })
  } catch (error) {
    console.error('Error sending message:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}