import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { verifyToken } from '@/lib/auth/jwt'
import { prisma } from '@/lib/prisma'

export async function GET(_request: NextRequest) {
  try {
    console.log('📊 KPI Analytics API called')
    
    // Check if database is available
    if (!process.env.DATABASE_URL) {
      console.log('⚠️ DATABASE_URL not set, returning mock data')
      return NextResponse.json({
        success: true,
        data: generateMockKPIData()
      })
    }
    
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

    // Get current month date range
    const now = new Date()
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1)
    const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0)

    console.log('📅 Date ranges:', { currentMonthStart, lastMonthStart, lastMonthEnd })

    // Get total users
    const totalUsers = await prisma.user.count()
    const lastMonthUsers = await prisma.user.count({
      where: { createdAt: { lt: currentMonthStart } }
    })
    const userGrowth = lastMonthUsers > 0 
      ? ((totalUsers - lastMonthUsers) / lastMonthUsers) * 100 
      : totalUsers > 0 ? 100 : 0

    // Get total orders
    const totalOrders = await prisma.order.count()
    const lastMonthOrders = await prisma.order.count({
      where: { createdAt: { lt: currentMonthStart } }
    })
    const orderGrowth = lastMonthOrders > 0 
      ? ((totalOrders - lastMonthOrders) / lastMonthOrders) * 100 
      : totalOrders > 0 ? 100 : 0

    // Calculate revenue (simplified - you may need to adjust based on your business logic)
    const totalRevenue = totalOrders * 25 // Assuming average $25 per order
    const lastMonthRevenue = lastMonthOrders * 25
    const revenueGrowth = lastMonthRevenue > 0 
      ? ((totalRevenue - lastMonthRevenue) / lastMonthRevenue) * 100 
      : totalRevenue > 0 ? 100 : 0

    // Calculate conversion rate
    const conversionRate = totalUsers > 0 ? (totalOrders / totalUsers) * 100 : 0
    const lastMonthConversionRate = lastMonthUsers > 0 ? (lastMonthOrders / lastMonthUsers) * 100 : 0
    const conversionGrowth = lastMonthConversionRate > 0 
      ? ((conversionRate - lastMonthConversionRate) / lastMonthConversionRate) * 100 
      : conversionRate > 0 ? 100 : 0

    const kpiData = {
      totalRevenue,
      totalUsers,
      totalOrders,
      conversionRate,
      revenueGrowth,
      userGrowth,
      orderGrowth,
      conversionGrowth
    }

    console.log('📈 KPI Data:', kpiData)

    return NextResponse.json({
      success: true,
      data: kpiData
    })
  } catch (error) {
    console.error('❌ KPI Analytics error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch KPI data',
        details: process.env.NODE_ENV === 'development' ? (error as Error).message : undefined
      },
      { status: 500 }
    )
  }
}

// Mock data generator for build time
function generateMockKPIData() {
  return {
    totalRevenue: 12500,
    totalUsers: 150,
    totalOrders: 500,
    conversionRate: 75.5,
    revenueGrowth: 12.5,
    userGrowth: 8.3,
    orderGrowth: 15.2,
    conversionGrowth: 5.1
  }
}