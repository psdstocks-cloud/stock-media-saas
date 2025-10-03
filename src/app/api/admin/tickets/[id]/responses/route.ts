import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// POST /api/admin/tickets/[id]/responses - Add response to ticket
export async function POST(
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
    const { content, isInternal = false, attachments } = body

    if (!content) {
      return NextResponse.json({ error: 'Content is required' }, { status: 400 })
    }

    // Check if ticket exists
    const ticket = await prisma.supportTicket.findUnique({
      where: { id }
    })

    if (!ticket) {
      return NextResponse.json({ error: 'Ticket not found' }, { status: 404 })
    }

    // Create response
    const response = await prisma.ticketResponse.create({
      data: {
        ticketId: id,
        userId: user.id,
        userEmail: user.email,
        userName: user.name,
        content,
        isInternal,
        attachments: attachments || null
      },
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
    })

    // Update ticket status if it's not internal
    if (!isInternal) {
      await prisma.supportTicket.update({
        where: { id },
        data: {
          status: 'IN_PROGRESS',
          updatedAt: new Date()
        }
      })
    }

    return NextResponse.json(response, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket response:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket response' },
      { status: 500 }
    )
  }
}

// GET /api/admin/tickets/[id]/responses - Get all responses for a ticket
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

    const responses = await prisma.ticketResponse.findMany({
      where: { ticketId: id },
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
    })

    return NextResponse.json(responses)
  } catch (error) {
    console.error('Error fetching ticket responses:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ticket responses' },
      { status: 500 }
    )
  }
}