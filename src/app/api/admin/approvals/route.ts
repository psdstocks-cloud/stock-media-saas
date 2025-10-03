import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { prisma } from '@/lib/prisma'
import { requirePermission } from '@/lib/rbac'
import { requestApproval } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('auth-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please log in again.' 
      }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid authentication token.' 
      }, { status: 401 })
    }
    
    const guard = await requirePermission(request, user.id, 'approvals.manage')
    if (guard) return guard

    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status') || 'PENDING'

    const approvals = await prisma.approvalRequest.findMany({
      where: { status },
      orderBy: { createdAt: 'desc' },
      include: {
        requestedBy: { select: { id: true, email: true, name: true } },
        approvedBy: { select: { id: true, email: true, name: true } },
      }
    })

    return NextResponse.json({ 
      success: true,
      approvals 
    })
  } catch (e) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to fetch approvals' 
    }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    // Get admin token from cookies
    const adminToken = request.cookies.get('auth-token')?.value;
    if (!adminToken) {
      return NextResponse.json({ 
        success: false,
        error: 'Authentication required. Please log in again.' 
      }, { status: 401 });
    }

    // Verify JWT token
    const user = verifyJWT(adminToken);
    if (!user?.id) {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid authentication token.' 
      }, { status: 401 })
    }

    const body = await request.json()
    const { type, resourceType, resourceId, amount, reason } = body
    if (!type || !resourceType || !resourceId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
    }

    const approval = await requestApproval({
      type,
      resourceType,
      resourceId,
      amount,
      reason,
      requestedById: user.id,
    })

    return NextResponse.json({ 
      success: true,
      approval 
    }, { status: 201 })
  } catch (e) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to create approval' 
    }, { status: 500 })
  }
}
