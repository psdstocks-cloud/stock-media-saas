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
    console.log('✏️ Individual Ticket PATCH API called for:', id)
    
    const user = await verifyAdmin(request)
    const { status, priority, assignedTo, response } = await request.json()
    
    console.log(`🎫 Updating ticket ${id} by ${user.email}`)
    
    // Mock response for now - in production this would update the database
    return NextResponse.json({
      success: true,
      message: 'Ticket updated successfully',
      ticket: {
        id: id,
        status: status || 'UPDATED',
        priority: priority || 'MEDIUM',
        assignedTo: assignedTo || user.email,
        updatedBy: user.email,
        updatedAt: new Date().toISOString(),
        response: response ? {
          id: `resp_${Date.now()}`,
          message: response,
          isStaff: true,
          authorName: user.name || user.email,
          createdAt: new Date().toISOString()
        } : null
      }
    })
    
  } catch (error) {
    console.error('❌ Individual Ticket PATCH error:', error)
    return NextResponse.json({
      success: false,
      error: 'Failed to update ticket',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 401 })
  }
}