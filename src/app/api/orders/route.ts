import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { checkRateLimit, getClientIdentifier } from '@/lib/rate-limit'
import { getUserFromRequest } from '@/lib/jwt-auth'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, 'general')

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Try JWT authentication first (for dashboard)
    const jwtUser = getUserFromRequest(request)
    let userId = jwtUser?.id
    
    // Fallback to NextAuth session if no JWT user
    if (!userId) {
      const session = await auth()
      if (!session?.user?.id) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      userId = session.user.id
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    // Build where clause
    const where: any = {
      userId: userId
    }

    if (status && status !== 'all') {
      where.status = status.toUpperCase()
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { stockSite: { displayName: { contains: search, mode: 'insensitive' } } }
      ]
    }

    // Fetch orders with pagination
    const [ordersRaw, totalCount] = await Promise.all([
      prisma.order.findMany({
        where,
        include: {
          stockSite: {
            select: {
              id: true,
              name: true,
              displayName: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.order.count({ where })
    ])

    // Normalize READY -> COMPLETED for consistency
    const orders = ordersRaw.map(o => ({
      ...o,
      status: o.status === 'READY' ? 'COMPLETED' : o.status
    }))

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasMore = page < totalPages

    return NextResponse.json({
      success: true,
      orders,
      pagination: {
        page,
        limit,
        totalCount,
        totalPages,
        hasMore
      }
    })

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch orders' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    // Rate limiting
    const identifier = getClientIdentifier(request)
    const rateLimitResult = await checkRateLimit(identifier, 'general')

    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: 'Too many requests' },
        { status: 429 }
      )
    }

    // Authentication
    const session = await auth()
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, orderIds } = body

    if (action === 'bulk_download') {
      // Handle bulk download request
      if (!Array.isArray(orderIds) || orderIds.length === 0) {
        return NextResponse.json(
          { error: 'Invalid order IDs' },
          { status: 400 }
        )
      }

      // Fetch the requested orders
      const orders = await prisma.order.findMany({
        where: {
          id: { in: orderIds },
          userId: session.user.id,
          status: 'COMPLETED',
          downloadUrl: { not: null }
        },
        select: {
          id: true,
          title: true,
          downloadUrl: true,
          fileName: true
        }
      })

      return NextResponse.json({
        success: true,
        orders: orders.map(order => ({
          id: order.id,
          title: order.title,
          downloadUrl: order.downloadUrl,
          fileName: order.fileName
        }))
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Orders API error:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}