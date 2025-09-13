import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const roomId = searchParams.get('roomId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')
    const skip = (page - 1) * limit

    if (!roomId) {
      return NextResponse.json({ error: 'Room ID is required' }, { status: 400 })
    }

    // Check if user is participant in the room
    const participant = await prisma.chatParticipant.findFirst({
      where: {
        roomId,
        userId: session.user.id
      }
    })

    if (!participant) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 })
    }

    // Get messages for the room
    const messages = await prisma.message.findMany({
      where: { roomId },
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
      orderBy: { createdAt: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: { roomId }
    })

    // Mark messages as read for this user
    await prisma.messageStatus.updateMany({
      where: {
        messageId: {
          in: messages.map(m => m.id)
        },
        userId: session.user.id,
        status: { not: 'READ' }
      },
      data: {
        status: 'READ',
        readAt: new Date()
      }
    })

    // Update participant's last read time
    await prisma.chatParticipant.update({
      where: { id: participant.id },
      data: { lastReadAt: new Date() }
    })

    return NextResponse.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching messages:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch messages' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { roomId, content, type = 'TEXT', fileUrl, fileName, fileSize, replyToId } = await request.json()

    if (!roomId || !content) {
      return NextResponse.json({ error: 'Room ID and content are required' }, { status: 400 })
    }

    // Check if user is participant in the room
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

    return NextResponse.json({
      success: true,
      message
    })

  } catch (error) {
    console.error('Error creating message:', error)
    return NextResponse.json({ 
      error: 'Failed to create message' 
    }, { status: 500 })
  }
}
