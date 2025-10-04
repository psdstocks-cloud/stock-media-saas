import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('🛒 Orders List API called')
    
    // Verify authentication
    const cookieStore = await cookies()
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

    // Parse query parameters
    const { searchParams } = new URL(request.url)
    const limit = parseInt(searchParams.get('limit') || '10')
    const page = parseInt(searchParams.get('page') || '1')
    const orderBy = searchParams.get('orderBy') || 'desc'
    const status = searchParams.get('status')

    // Build where clause
    const where = status ? { status } : {}

    // Get orders with pagination
    const orders = await prisma.order.findMany({
      where,
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      orderBy: {
        createdAt: orderBy === 'desc' ? 'desc' : 'asc'
      },
      skip: (page - 1) * limit,
      take: limit
    })

    // Get total count
    const totalOrders = await prisma.order.count({ where })

    console.log('🛒 Found', orders.length, 'orders out of', totalOrders, 'total')

    return NextResponse.json({
      success: true,
      data: orders,
      pagination: {
        page,
        limit,
        total: totalOrders,
        pages: Math.ceil(totalOrders / limit)
      }
    })
  } catch (error) {
    console.error('❌ Orders List error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch orders',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}