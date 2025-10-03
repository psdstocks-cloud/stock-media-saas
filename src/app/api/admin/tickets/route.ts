import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { verifyJWT } from '@/lib/jwt-auth'
import { cookies } from 'next/headers'

export const dynamic = 'force-dynamic'

// GET /api/admin/tickets - List all tickets with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const department = searchParams.get('department')
    const assignedTo = searchParams.get('assignedTo')
    const search = searchParams.get('search')
    const sortBy = searchParams.get('sortBy') || 'createdAt'
    const sortOrder = searchParams.get('sortOrder') || 'desc'

    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    
    if (status && status !== 'all') {
      where.status = status
    }
    
    if (priority && priority !== 'all') {
      where.priority = priority
    }
    
    if (department && department !== 'all') {
      where.department = department
    }
    
    if (assignedTo && assignedTo !== 'all') {
      if (assignedTo === 'unassigned') {
        where.assignedTo = null
      } else {
        where.assignedTo = assignedTo
      }
    }
    
    if (search) {
      where.OR = [
        { subject: { contains: search, mode: 'insensitive' } },
        { ticketNumber: { contains: search, mode: 'insensitive' } },
        { userEmail: { contains: search, mode: 'insensitive' } },
        { userName: { contains: search, mode: 'insensitive' } }
      ]
    }

    // Build orderBy clause
    const orderBy: any = {}
    orderBy[sortBy] = sortOrder

    const [tickets, totalCount] = await Promise.all([
      prisma.supportTicket.findMany({
        where,
        orderBy,
        skip,
        take: limit,
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
          },
          responses: {
            orderBy: { createdAt: 'desc' },
            take: 1,
            select: {
              id: true,
              content: true,
              createdAt: true,
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          },
          _count: {
            select: {
              responses: true
            }
          }
        }
      }),
      prisma.supportTicket.count({ where })
    ])

    const totalPages = Math.ceil(totalCount / limit)

    return NextResponse.json({
      tickets,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1
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

// POST /api/admin/tickets - Create a new ticket (for admin use)
export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const token = cookieStore.get('auth-token')?.value
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const user = verifyJWT(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }
    if (user.role !== 'admin' && user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 })
    }

    const body = await request.json()
    const {
      subject,
      department,
      message,
      priority,
      userId,
      userEmail,
      userName,
      orderReference,
      assignedTo
    } = body

    // Generate ticket number
    const ticketNumber = `TKT-${Date.now()}-${Math.random().toString(36).substr(2, 4).toUpperCase()}`

    // Calculate SLA due date based on priority
    const slaDueDate = new Date()
    switch (priority) {
      case 'urgent':
        slaDueDate.setHours(slaDueDate.getHours() + 4) // 4 hours
        break
      case 'high':
        slaDueDate.setHours(slaDueDate.getHours() + 12) // 12 hours
        break
      case 'medium':
        slaDueDate.setDate(slaDueDate.getDate() + 1) // 1 day
        break
      case 'low':
        slaDueDate.setDate(slaDueDate.getDate() + 3) // 3 days
        break
      default:
        slaDueDate.setDate(slaDueDate.getDate() + 1) // 1 day
    }

    const ticket = await prisma.supportTicket.create({
      data: {
        ticketNumber,
        subject,
        category: department, // Using department as category
        department,
        message,
        priority,
        status: 'OPEN',
        userId,
        userEmail,
        userName,
        orderReference,
        assignedTo,
        slaDueDate,
        attachments: body.attachments || null
      },
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

    return NextResponse.json(ticket, { status: 201 })
  } catch (error) {
    console.error('Error creating ticket:', error)
    return NextResponse.json(
      { error: 'Failed to create ticket' },
      { status: 500 }
    )
  }
}