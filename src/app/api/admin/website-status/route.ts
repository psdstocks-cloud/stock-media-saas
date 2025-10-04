import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🌐 Website Status GET API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json(
        { success: false, error: 'Access denied' },
        { status: 403 }
      )
    }

    const stockSites = await prisma.stockSite.findMany({
      orderBy: { name: 'asc' }
    })

    // Convert StockSite to WebsiteStatus format
    const websiteStatuses = stockSites.map(site => ({
      id: site.id,
      name: site.name,
      displayName: site.displayName || site.name,
      status: site.isActive ? 'AVAILABLE' : 'DISABLED',
      maintenanceMessage: '',
      lastStatusChange: site.updatedAt.toISOString(),
      category: site.category || 'other',
      isActive: site.isActive
    }))

    console.log('✅ Website statuses retrieved:', websiteStatuses.length)

    return NextResponse.json({
      success: true,
      data: websiteStatuses
    })
  } catch (error) {
    console.error('❌ Website Status GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch website statuses' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    console.log('🔄 Website Status PUT API called')
    
    const cookieStore = await cookies()
    const accessToken = cookieStore.get('admin_access_token')?.value

    if (!accessToken) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      )
    }

    const payload = await verifyToken(accessToken)
    
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

    const isActive = status === 'AVAILABLE'

    const updatedSite = await prisma.stockSite.update({
      where: { id: siteId },
      data: {
        isActive,
        updatedAt: new Date()
      }
    })

    console.log('✅ Website status updated:', updatedSite.name, status)

    return NextResponse.json({
      success: true,
      data: updatedSite
    })
  } catch (error) {
    console.error('❌ Website Status PUT error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update website status' },
      { status: 500 }
    )
  }
}