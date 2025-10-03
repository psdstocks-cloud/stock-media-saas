import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
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
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const department = searchParams.get('department')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (status && status !== 'ALL') {
      where.status = status
    }

    if (priority && priority !== 'ALL') {
      where.priority = priority
    }

    if (department && department !== 'ALL') {
      where.department = department
    }

    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Fetch tickets with pagination
    const [tickets, total] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        include: {
          assignedToUser: {
            select: {
              id: true,
              name: true,
              email: true
            }
          },
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 5
          },
          user: {
            select: {
              id: true,
              name: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.supportTicket.count({ where })
    ])

    // Get ticket statistics
    const stats = await prisma.supportTicket.groupBy({
      by: ['status'],
      _count: { status: true }
    })

    const statusStats = stats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.status
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      },
      stats: {
        total,
        open: statusStats.OPEN || 0,
        inProgress: statusStats.IN_PROGRESS || 0,
        resolved: statusStats.RESOLVED || 0,
        closed: statusStats.CLOSED || 0
      }
    })
  } catch (error) {
    console.error('Error fetching tickets:', error)
    return NextResponse.json(
      { error: 'Failed to fetch tickets' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
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
    const { subject, category, department, message, priority, userEmail, userName, orderReference } = body

    // Validate required fields
    if (!subject || !category || !department || !message || !priority || !userEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate ticket number
    const ticketNumber = `ST-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`

    // Create ticket
    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        category,
        department,
        message,
        priority: priority.toUpperCase(),
        status: 'OPEN',
        userId: session.user.id, // Admin creating ticket
        userEmail,
        userName,
        orderReference,
        assignedTo: session.user.id // Assign to creator
      },
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

    return NextResponse.json({ ticket }, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}
