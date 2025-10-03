import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !['admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const { message, isInternal = false, attachments } = body

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create response
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: params.id,
        userId: session.user.id,
        userEmail: session.user.email || '',
        userName: session.user.name || '',
        message,
        isInternal,
        attachments: attachments || null
      },
      include: {
        ticket: {
          select: {
            ticketNumber: true,
            subject: true
          }
        }
      }
    })

    // Update ticket status to IN_PROGRESS if it was OPEN
    if (ticket.status === 'OPEN') {
      await prisma.supportTicket.update({
        where: { id: params.id },
        data: { status: 'IN_PROGRESS' }
      })
    }

    return NextResponse.json({ response }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket response:', error)
    return NextResponse.json(
      { error: 'Failed to create response' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || !['admin', 'ADMIN', 'SUPER_ADMIN'].includes(user.role)) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get query parameters
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Fetch responses
    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId: params.id },
      orderBy: { createdAt: 'asc' },
      skip: (page - 1) * limit,
      take: limit
    })

    return NextResponse.json({ responses })
  } catch (error) {
    console.error('Error fetching ticket responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch responses' },
      { status: 500 }
    )
  }
}
