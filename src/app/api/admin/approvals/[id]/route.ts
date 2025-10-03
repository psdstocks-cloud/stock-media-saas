import { NextRequest, NextResponse } from 'next/server'
import { verifyJWT } from '@/lib/jwt-auth'
import { requirePermission } from '@/lib/rbac'
import { approveRequest, rejectRequest } from '@/lib/dualControl'

export const dynamic = 'force-dynamic'

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
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

    const { id } = await params
    const { action, reason } = await request.json()

    if (action === 'approve') {
      const approval = await approveRequest({ id, approvedById: user.id })
      return NextResponse.json({ 
        success: true,
        approval 
      })
    } else if (action === 'reject') {
      const approval = await rejectRequest({ id, approvedById: user.id, reason })
      return NextResponse.json({ 
        success: true,
        approval 
      })
    } else {
      return NextResponse.json({ 
        success: false,
        error: 'Invalid action' 
      }, { status: 400 })
    }
  } catch (e) {
    return NextResponse.json({ 
      success: false,
      error: 'Failed to update approval' 
    }, { status: 500 })
  }
}
