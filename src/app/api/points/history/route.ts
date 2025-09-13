import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { rateLimiters } from '@/lib/rate-limiter'

export async function GET(request: NextRequest) {
  try {
    // Rate limiting
    const clientId = request.headers.get('x-forwarded-for') || 'unknown'
    const rateLimitResult = await rateLimiters.pointsHistory.checkLimit(clientId)
    
    if (!rateLimitResult.success) {
      return NextResponse.json(
        { error: rateLimitResult.message },
        { status: 429 }
      )
    }

    // Authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = Math.min(parseInt(searchParams.get('limit') || '20'), 100) // Max 100 items
    const type = searchParams.get('type') // Filter by transaction type
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const timezone = searchParams.get('timezone') || 'UTC'

    // Validate timezone
    try {
      Intl.DateTimeFormat(undefined, { timeZone: timezone })
    } catch {
      return NextResponse.json({ error: 'Invalid timezone' }, { status: 400 })
    }

    // Build where clause
    const whereClause: any = {
      userId: session.user.id
    }

    // Add type filter
    if (type && ['SUBSCRIPTION', 'PURCHASE', 'ROLLOVER', 'DOWNLOAD', 'REFUND', 'BONUS', 'ADMIN_ADJUSTMENT'].includes(type)) {
      whereClause.type = type
    }

    // Add date range filter
    if (startDate || endDate) {
      whereClause.createdAt = {}
      if (startDate) {
        whereClause.createdAt.gte = new Date(startDate)
      }
      if (endDate) {
        whereClause.createdAt.lte = new Date(endDate)
      }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Fetch points history with related order data
    const [history, totalCount] = await Promise.all([
      prisma.pointsHistory.findMany({
        where: whereClause,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          order: {
            select: {
              id: true,
              title: true,
              stockItemId: true,
              stockItemUrl: true,
              status: true,
              stockSite: {
                select: {
                  displayName: true,
                  name: true
                }
              }
            }
          }
        }
      }),
      prisma.pointsHistory.count({ where: whereClause })
    ])

    // Format dates with timezone
    const formattedHistory = history.map(entry => {
      const date = new Date(entry.createdAt)
      
      return {
        id: entry.id,
        type: entry.type,
        amount: entry.amount,
        description: entry.description,
        createdAt: date.toLocaleString('en-US', {
          timeZone: timezone,
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit',
          hour12: false
        }),
        createdAtISO: entry.createdAt.toISOString(),
        order: entry.order ? {
          id: entry.order.id,
          title: entry.order.title,
          stockItemId: entry.order.stockItemId,
          stockItemUrl: entry.order.stockItemUrl,
          status: entry.order.status,
          stockSite: entry.order.stockSite
        } : null
      }
    })

    // Calculate pagination info
    const totalPages = Math.ceil(totalCount / limit)
    const hasNextPage = page < totalPages
    const hasPrevPage = page > 1

    // Get summary statistics
    const summary = await prisma.pointsHistory.aggregate({
      where: {
        userId: session.user.id,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    // Get type breakdown
    const typeBreakdown = await prisma.pointsHistory.groupBy({
      by: ['type'],
      where: {
        userId: session.user.id,
        ...(startDate || endDate ? {
          createdAt: {
            ...(startDate && { gte: new Date(startDate) }),
            ...(endDate && { lte: new Date(endDate) })
          }
        } : {})
      },
      _sum: {
        amount: true
      },
      _count: {
        id: true
      }
    })

    const response = {
      success: true,
      data: {
        history: formattedHistory,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages,
          hasNextPage,
          hasPrevPage
        },
        summary: {
          totalTransactions: summary._count.id,
          netAmount: summary._sum.amount || 0,
          typeBreakdown: typeBreakdown.map(type => ({
            type: type.type,
            count: type._count.id,
            totalAmount: type._sum.amount || 0
          }))
        },
        timezone,
        generatedAt: new Date().toISOString()
      }
    }

    // Add rate limit headers
    const responseHeaders = new Headers()
    responseHeaders.set('X-RateLimit-Limit', '30')
    responseHeaders.set('X-RateLimit-Remaining', (30 - rateLimitResult.remaining).toString())
    responseHeaders.set('X-RateLimit-Reset', new Date(rateLimitResult.resetTime).toISOString())
    responseHeaders.set('Cache-Control', 'private, max-age=60, stale-while-revalidate=120')

    return NextResponse.json(response, { 
      status: 200,
      headers: responseHeaders
    })

  } catch (error) {
    console.error('Error fetching points history:', error)
    return NextResponse.json(
      { error: 'Failed to fetch points history' },
      { status: 500 }
    )
  }
}

// Note: Rate limit checking is handled internally by the GET function
