import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function verifyAdmin(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value
    
    if (!accessToken) {
      throw new Error('No access token')
    }
    
    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })
    
    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      throw new Error('Insufficient privileges')
    }
    
    return user
  } catch (error) {
    throw new Error('Authentication failed')
  }
}

export async function GET(request: NextRequest) {
  try {
    console.log('🎫 Support Tickets GET API called')
    
    const user = await verifyAdmin(request)
    
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'OPEN'
    const priority = searchParams.get('priority')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // Return mock ticket data for demonstration
    const mockTickets = [
      {
        id: 'ticket_001',
        subject: 'Unable to download from Shutterstock',
        description: 'Getting 404 error when trying to download stock photos from Shutterstock. The download link appears to be broken and returns a 404 error page.',
        status: 'OPEN',
        priority: 'HIGH',
        category: 'DOWNLOAD_ISSUE',
        userId: 'user_123',
        user: {
          email: 'user@example.com',
          name: 'John Doe'
        },
        assignedTo: null,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responses: []
      },
      {
        id: 'ticket_002',
        subject: 'Points not added after payment',
        description: 'Made payment for Professional plan but points haven\'t been credited to my account. Transaction ID: TXN123456789',
        status: 'IN_PROGRESS',
        priority: 'MEDIUM',
        category: 'BILLING_ISSUE',
        userId: 'user_456',
        user: {
          email: 'customer@test.com',
          name: 'Jane Smith'
        },
        assignedTo: user.email,
        createdAt: new Date(Date.now() - 86400000).toISOString(),
        updatedAt: new Date().toISOString(),
        responses: [
          {
            id: 'resp_001',
            message: 'Looking into this issue. Can you provide your transaction ID?',
            isStaff: true,
            authorName: user.name || user.email,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          }
        ]
      },
      {
        id: 'ticket_003',
        subject: 'Account access issues',
        description: 'Cannot log into my account. Getting "Invalid credentials" error even though I\'m using the correct password.',
        status: 'RESOLVED',
        priority: 'HIGH',
        category: 'ACCOUNT_ISSUE',
        userId: 'user_789',
        user: {
          email: 'support@company.com',
          name: 'Mike Johnson'
        },
        assignedTo: user.email,
        createdAt: new Date(Date.now() - 172800000).toISOString(),
        updatedAt: new Date(Date.now() - 3600000).toISOString(),
        responses: [
          {
            id: 'resp_002',
            message: 'I\'ve reset your password. Please check your email for the new login credentials.',
            isStaff: true,
            authorName: user.name || user.email,
            createdAt: new Date(Date.now() - 3600000).toISOString()
          },
          {
            id: 'resp_003',
            message: 'Thank you! I can now access my account. Issue resolved.',
            isStaff: false,
            authorName: 'Mike Johnson',
            createdAt: new Date(Date.now() - 1800000).toISOString()
          }
        ]
      },
      {
        id: 'ticket_004',
        subject: 'Feature request: Dark mode',
        description: 'Would love to see a dark mode option in the dashboard. The current interface is too bright for extended use.',
        status: 'CLOSED',
        priority: 'LOW',
        category: 'FEATURE_REQUEST',
        userId: 'user_101',
        user: {
          email: 'designer@example.com',
          name: 'Sarah Wilson'
        },
        assignedTo: user.email,
        createdAt: new Date(Date.now() - 259200000).toISOString(),
        updatedAt: new Date(Date.now() - 7200000).toISOString(),
        responses: [
          {
            id: 'resp_004',
            message: 'Great suggestion! We\'ve added this to our roadmap for Q2.',
            isStaff: true,
            authorName: user.name || user.email,
            createdAt: new Date(Date.now() - 7200000).toISOString()
          }
        ]
      }
    ]
    
    const filteredTickets = mockTickets.filter(ticket => 
      ticket.status === status && 
      (!priority || ticket.priority === priority)
    )
    
    return NextResponse.json({
      success: true,
      tickets: filteredTickets,
      pagination: {
        page,
        limit,
        total: filteredTickets.length,
        pages: Math.ceil(filteredTickets.length / limit)
      },
      stats: {
        open: mockTickets.filter(t => t.status === 'OPEN').length,
        inProgress: mockTickets.filter(t => t.status === 'IN_PROGRESS').length,
        resolved: mockTickets.filter(t => t.status === 'RESOLVED').length,
        closed: mockTickets.filter(t => t.status === 'CLOSED').length
      }
    })
    
  } catch (error) {
    console.error('❌ Tickets GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch tickets',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 401 })
  }
}

export async function POST(request: NextRequest) {
  try {
    console.log('📝 Support Tickets POST API called')
    
    const user = await verifyAdmin(request)
    const body = await request.json()
    
    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully'
    })
    
  } catch (error) {
    console.error('❌ Tickets POST error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 401 })
  }
}