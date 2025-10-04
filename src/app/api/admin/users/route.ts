import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    console.log('👥 Users List API called')
    
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
    const search = searchParams.get('search')

    // Build where clause
    const where = search ? {
      OR: [
        { email: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } }
      ]
    } : {}

    // Get users with pagination
    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        emailVerified: true,
        _count: {
          select: {
            orders: true
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
    const totalUsers = await prisma.user.count({ where })

    console.log('👥 Found', users.length, 'users out of', totalUsers, 'total')

    return NextResponse.json({
      success: true,
      data: users.map(user => ({
        ...user,
        orderCount: user._count.orders
      })),
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit)
      }
    })
  } catch (error) {
    console.error('❌ Users List error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch users',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}