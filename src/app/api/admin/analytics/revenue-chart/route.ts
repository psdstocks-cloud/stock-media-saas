import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    console.log('📈 Revenue Chart API called')
    
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

    // Generate sample revenue data for the last 30 days
    const revenueData = []
    const today = new Date()
    
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today)
      date.setDate(date.getDate() - i)
      
      // Get orders for this day
      const dayStart = new Date(date)
      dayStart.setHours(0, 0, 0, 0)
      const dayEnd = new Date(date)
      dayEnd.setHours(23, 59, 59, 999)
      
      const ordersCount = await prisma.order.count({
        where: {
          createdAt: {
            gte: dayStart,
            lte: dayEnd
          }
        }
      })
      
      revenueData.push({
        date: date.toISOString().split('T')[0], // YYYY-MM-DD format
        revenue: ordersCount * 25, // Assuming $25 per order
        orders: ordersCount
      })
    }

    console.log('📊 Revenue chart data generated for', revenueData.length, 'days')

    return NextResponse.json({
      success: true,
      data: revenueData
    })
  } catch (error) {
    console.error('❌ Revenue Chart error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch revenue data',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}