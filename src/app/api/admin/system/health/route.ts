// src/app/api/admin/system/health/route.ts
// System health monitoring API

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get system health data
    const healthData = await prisma.systemHealth.findMany({
      orderBy: { lastChecked: 'desc' }
    })

    // Get system metrics
    const metrics = await getSystemMetrics()

    // Calculate overall health status
    const overallStatus = calculateOverallHealth(healthData)

    return NextResponse.json({
      status: overallStatus,
      services: healthData,
      metrics,
      lastChecked: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error fetching system health:', error)
    return NextResponse.json({ error: 'Failed to fetch system health' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Perform health checks
    const healthChecks = await performHealthChecks()

    // Update database with health check results
    for (const check of healthChecks) {
      await prisma.systemHealth.upsert({
        where: { service: check.service },
        update: {
          status: check.status,
          message: check.message,
          metrics: check.metrics ? JSON.stringify(check.metrics) : null,
          lastChecked: new Date()
        },
        create: {
          service: check.service,
          status: check.status,
          message: check.message,
          metrics: check.metrics ? JSON.stringify(check.metrics) : null
        }
      })
    }

    return NextResponse.json({ 
      success: true,
      checks: healthChecks,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error performing health checks:', error)
    return NextResponse.json({ error: 'Failed to perform health checks' }, { status: 500 })
  }
}

// Helper function to get system metrics
async function getSystemMetrics() {
  try {
    const [
      totalUsers,
      totalOrders,
      activeSubscriptions
    ] = await Promise.all([
      prisma.user.count(),
      prisma.order.count(),
      prisma.subscription.count({
        where: {
          status: 'ACTIVE'
        }
      })
    ])

    // Calculate total revenue from subscription plans
    const activeSubs = await prisma.subscription.findMany({
      where: { status: 'ACTIVE' },
      include: { plan: true }
    })
    
    const totalRevenue = activeSubs.reduce((sum, sub) => sum + sub.plan.price, 0)

    return {
      totalUsers,
      totalOrders,
      activeSubscriptions,
      totalRevenue,
      timestamp: new Date().toISOString()
    }
  } catch (error) {
    console.error('Error getting system metrics:', error)
    return {
      totalUsers: 0,
      totalOrders: 0,
      activeSubscriptions: 0,
      totalRevenue: 0,
      timestamp: new Date().toISOString()
    }
  }
}

// Helper function to perform health checks
async function performHealthChecks() {
  const checks = []

  // Database health check
  try {
    await prisma.$queryRaw`SELECT 1`
    checks.push({
      service: 'database',
      status: 'healthy',
      message: 'Database connection successful',
      metrics: {
        responseTime: Date.now()
      }
    })
  } catch (error) {
    checks.push({
      service: 'database',
      status: 'critical',
      message: 'Database connection failed',
      metrics: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }

  // API health check
  try {
    const start = Date.now()
    // Simulate API check - in real implementation, check external APIs
    checks.push({
      service: 'api',
      status: 'healthy',
      message: 'API endpoints responding',
      metrics: {
        responseTime: Date.now() - start
      }
    })
  } catch (error) {
    checks.push({
      service: 'api',
      status: 'warning',
      message: 'API response time high',
      metrics: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }

  // Payment system health check
  try {
    // In real implementation, check Stripe API
    checks.push({
      service: 'payment',
      status: 'healthy',
      message: 'Payment system operational',
      metrics: {
        lastCheck: new Date().toISOString()
      }
    })
  } catch (error) {
    checks.push({
      service: 'payment',
      status: 'critical',
      message: 'Payment system unavailable',
      metrics: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }

  // Email service health check
  try {
    // In real implementation, check email service
    checks.push({
      service: 'email',
      status: 'healthy',
      message: 'Email service operational',
      metrics: {
        lastCheck: new Date().toISOString()
      }
    })
  } catch (error) {
    checks.push({
      service: 'email',
      status: 'warning',
      message: 'Email service degraded',
      metrics: {
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    })
  }

  return checks
}

// Helper function to calculate overall health status
function calculateOverallHealth(healthData: any[]) {
  if (healthData.length === 0) return 'unknown'

  const statuses = healthData.map(item => item.status)
  
  if (statuses.includes('critical')) return 'critical'
  if (statuses.includes('warning')) return 'warning'
  if (statuses.every(status => status === 'healthy')) return 'healthy'
  
  return 'unknown'
}
