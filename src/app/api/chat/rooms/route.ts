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
    const type = searchParams.get('type') || 'SUPPORT'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Get user's chat rooms
    const rooms = await prisma.chatRoom.findMany({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        },
        type: type as any,
        status: 'ACTIVE'
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        },
        messages: {
          take: 1,
          orderBy: { createdAt: 'desc' },
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
        _count: {
          select: {
            messages: true,
            participants: true
          }
        }
      },
      orderBy: { lastMessageAt: 'desc' },
      skip,
      take: limit
    })

    // Get total count for pagination
    const totalCount = await prisma.chatRoom.count({
      where: {
        participants: {
          some: {
            userId: session.user.id
          }
        },
        type: type as any,
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      rooms,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    })

  } catch (error) {
    console.error('Error fetching chat rooms:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch chat rooms' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { name, type = 'SUPPORT', priority = 'MEDIUM' } = await request.json()

    // Create new chat room
    const room = await prisma.chatRoom.create({
      data: {
        name: name || `Support Chat - ${new Date().toLocaleDateString()}`,
        type: type as any,
        priority: priority as any,
        participants: {
          create: {
            userId: session.user.id,
            role: 'MEMBER'
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
                role: true
              }
            }
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      room
    })

  } catch (error) {
    console.error('Error creating chat room:', error)
    return NextResponse.json({ 
      error: 'Failed to create chat room' 
    }, { status: 500 })
  }
}
