import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/admin/tickets/[id] - Get ticket details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const ticket = await prisma.supportTicket.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
            createdAt: true,
            lastLoginAt: true
          }
        },
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
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error fetching ticket:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket' },
      { status: 500 }
    )
  }
}

// PUT /api/admin/tickets/[id] - Update ticket
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()
    const {
      status,
      priority,
      assignedTo,
      internalNotes,
      response
    } = body

    const updateData: any = {}
    
    if (status) {
      updateData.status = status
      if (status === 'RESOLVED') {
        updateData.resolvedAt = new Date()
      } else if (status === 'CLOSED') {
        updateData.closedAt = new Date()
      }
    }
    
    if (priority) {
      updateData.priority = priority
    }
    
    if (assignedTo !== undefined) {
      updateData.assignedTo = assignedTo
    }
    
    if (internalNotes !== undefined) {
      updateData.internalNotes = internalNotes
    }

    const ticket = await prisma.supportTicket.update({
      where: { id },
      data: updateData,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true
          }
        },
        assignedToUser: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      }
    })

    // If response is provided, create a ticket response
    if (response) {
      await prisma.ticketResponse.create({
        data: {
          ticketId: id,
          userId: user.id,
          userEmail: user.email,
          userName: user.name,
          content: response,
          isInternal: false
        }
      })
    }

    return NextResponse.json(ticket)
  } catch (error) {
    console.error('Error updating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to update ticket' },
      { status: 500 }
    )
  }
}

// DELETE /api/admin/tickets/[id] - Delete ticket
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user || (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    await prisma.supportTicket.delete({
      where: { id }
    })

    return NextResponse.json({ message: 'Ticket deleted successfully' })
  } catch (error) {
    console.error('Error deleting ticket:', error)
    return NextResponse.json(
      { error: 'Failed to delete ticket' },
      { status: 500 }
    )
  }
}