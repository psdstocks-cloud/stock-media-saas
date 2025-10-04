import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Website Status API called')
    
    // Verify authentication
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    // Get all stock sites with their status
    const stockSites = await prisma.stockSite.findMany({
      select: {
        id: true,
        name: true,
        displayName: true,
        cost: true,
        isActive: true,
        status: true,
        maintenanceMessage: true,
        lastStatusChange: true,
        category: true,
        icon: true,
        statusChangedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        displayName: 'asc'
      }
    })

    console.log('🌐 Found', stockSites.length, 'stock sites')

    return NextResponse.json({
      success: true,
      data: stockSites
    })
  } catch (error) {
    console.error('❌ Website Status error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch website status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🌐 Website Status Update API called')
    
    // Verify authentication
    const cookieStore = cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    // Verify admin role
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const body = await request.json()
    const { siteId, status, maintenanceMessage } = body

    if (!siteId || !status) {
      return NextResponse.json(
        { success: false, error: 'Site ID and status are required' },
        { status: 400 }
      )
    }

    // Validate status
    const validStatuses = ['AVAILABLE', 'MAINTENANCE', 'DISABLED']
    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { success: false, error: 'Invalid status' },
        { status: 400 }
      )
    }

    // Update the stock site status
    const updatedSite = await prisma.stockSite.update({
      where: { id: siteId },
      data: {
        status: status as any,
        maintenanceMessage: maintenanceMessage || null,
        lastStatusChange: new Date(),
        statusChangedBy: user.id
      },
      select: {
        id: true,
        name: true,
        displayName: true,
        status: true,
        maintenanceMessage: true,
        lastStatusChange: true,
        statusChangedByUser: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Log the action
    await prisma.adminAuditLog.create({
      data: {
        userId: user.id,
        action: 'WEBSITE_STATUS_CHANGE',
        details: {
          siteId: siteId,
          siteName: updatedSite.displayName,
          oldStatus: 'UNKNOWN', // We could track this if needed
          newStatus: status,
          maintenanceMessage: maintenanceMessage
        },
        ipAddress: request.ip || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
      },
    })

    console.log('🌐 Updated website status:', updatedSite.displayName, 'to', status)

    return NextResponse.json({
      success: true,
      data: updatedSite
    })
  } catch (error) {
    console.error('❌ Website Status Update error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update website status',
        details: process.env.NODE_ENV === 'development' ? error.message : undefined
      },
      { status: 500 }
    )
  }
}
