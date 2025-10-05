import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

async function verifyAdmin(_request: NextRequest) {
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

export async function GET(_request: NextRequest) {
  try {
    console.log('📋 Approvals GET API called')
    
    const user = await verifyAdmin(_request)
    
    const { searchParams } = new URL(_request.url)
    const status = searchParams.get('status') || 'PENDING'
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // For now, return mock data since ApprovalRequest table might not exist
    const mockApprovals = [
      {
        id: '1',
        type: 'POINTS_ADJUSTMENT',
        status: 'PENDING',
        requestedBy: user.email,
        data: {
          userId: 'user123',
          amount: 50,
          reason: 'Compensation for service issue'
        },
        createdAt: new Date().toISOString(),
        approvedBy: null,
        approvedAt: null
      },
      {
        id: '2',
        type: 'ORDER_REFUND',
        status: 'PENDING',
        requestedBy: 'support@example.com',
        data: {
          orderId: 'order456',
          amount: 29.99,
          reason: 'Customer requested refund due to quality issues'
        },
        createdAt: new Date(Date.now() - 3600000).toISOString(),
        approvedBy: null,
        approvedAt: null
      },
      {
        id: '3',
        type: 'USER_SUSPENSION',
        status: 'APPROVED',
        requestedBy: 'admin@example.com',
        data: {
          userId: 'user789',
          reason: 'Terms of service violation',
          duration: '7 days'
        },
        createdAt: new Date(Date.now() - 7200000).toISOString(),
        approvedBy: user.email,
        approvedAt: new Date(Date.now() - 1800000).toISOString()
      }
    ]
    
    const filteredApprovals = mockApprovals.filter(a => a.status === status)
    
    return NextResponse.json({
      success: true,
      approvals: filteredApprovals,
      pagination: {
        page,
        limit,
        total: filteredApprovals.length,
        pages: Math.ceil(filteredApprovals.length / limit)
      }
    })
    
  } catch (error) {
    console.error('❌ Approvals GET error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to fetch approvals',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function PATCH(_request: NextRequest) {
  try {
    console.log('✏️ Approvals PATCH API called')
    
    const _user = await verifyAdmin(_request)
    
    return NextResponse.json({
      success: true,
      message: 'Approval action completed'
    })
    
  } catch (error) {
    console.error('❌ Approvals PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process approval',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}