import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

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

    // Fetch ticket with all details
    const ticket = await prisma.supportTicket.findUnique({
      where: { id: params.id },
      include: {
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        responses: {
          orderBy: { createdAt: 'asc' },
          include: {
            ticket: {
              select: {
                ticketNumber: true
              }
            }
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

export async function PATCH(
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
    const { status, assignedTo, priority, internalNotes, response } = body

    // Build update data
    const updateData: any = {}

    if (status) {
      updateData.status = status
      
      // Set timestamps based on status
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (status === 'CLOSED') {
        updateData.closedAt = new Date()
      }
    }

    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo || null
    }

    if (priority) {
      updateData.priority = priority.toUpperCase()
    }

    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes
    }

    if (response) {
      updateData.response = response
    }

    // Update ticket
    const ticket = await prisma.supportTicket.update({
      where: { id: params.id },
      data: updateData,
      include: {
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        },
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // If there's a response, create a ticket response
    if (response) {
      await prisma.ticketResponse.create({
        data: {
          ticketId: params.id,
          userId: session.user.id,
          userEmail: session.user.email || '',
          userName: session.user.name || '',
          message: response,
          isInternal: false
        }
      })
    }

    return NextResponse.json({ ticket })
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Delete ticket (cascade will delete responses)
    await prisma.supportTicket.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}
