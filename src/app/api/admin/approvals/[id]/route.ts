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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    console.log('✏️ Individual Approval PATCH API called for:', id)
    
    const user = await verifyAdmin(request)
    const { action, reason } = await request.json()
    
    console.log(`📋 Processing ${action} action by ${user.email}`)
    
    // Mock response for now - in production this would update the database
    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED'
    
    return NextResponse.json({
      success: true,
      message: `Approval ${action}ed successfully`,
      approval: {
        id: id,
        status: newStatus,
        approvedBy: user.email,
        approvedAt: new Date().toISOString(),
        reason: reason || `Approval ${action}ed by ${user.email}`
      }
    })
    
  } catch (error) {
    console.error('❌ Individual Approval PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to process approval action',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}