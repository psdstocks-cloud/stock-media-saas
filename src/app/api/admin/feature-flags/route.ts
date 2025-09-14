// src/app/api/admin/feature-flags/route.ts
// Feature flags management API

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const search = searchParams.get('search')
    const status = searchParams.get('status')

    const skip = (page - 1) * limit
    const where: any = {}

    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } }
      ]
    }

    if (status === 'enabled') {
      where.isEnabled = true
    } else if (status === 'disabled') {
      where.isEnabled = false
    }

    const [featureFlags, total] = await Promise.all([
      prisma.featureFlag.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' }
      }),
      prisma.featureFlag.count({ where })
    ])

    return NextResponse.json({
      featureFlags,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    })
  } catch (error) {
    console.error('Error fetching feature flags:', error)
    return NextResponse.json({ error: 'Failed to fetch feature flags' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if user is admin
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { role: true }
    })

    if (!user || (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { name, description, isEnabled, rolloutPercentage, targetUsers, conditions } = await request.json()

    if (!name) {
      return NextResponse.json({ error: 'Feature flag name is required' }, { status: 400 })
    }

    // Check if feature flag already exists
    const existing = await prisma.featureFlag.findUnique({
      where: { name }
    })

    if (existing) {
      return NextResponse.json({ error: 'Feature flag with this name already exists' }, { status: 409 })
    }

    const featureFlag = await prisma.featureFlag.create({
      data: {
        name,
        description,
        isEnabled: isEnabled || false,
        rolloutPercentage: rolloutPercentage || 0,
        targetUsers: targetUsers ? JSON.stringify(targetUsers) : null,
        conditions: conditions ? JSON.stringify(conditions) : null
      }
    })

    // Create audit log
    const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await createAuditLog({
      adminId: session.user.id,
      action: 'CREATE',
      resourceType: 'feature_flag',
      resourceId: featureFlag.id,
      newValues: {
        name: featureFlag.name,
        isEnabled: featureFlag.isEnabled,
        rolloutPercentage: featureFlag.rolloutPercentage
      },
      ipAddress: clientIP,
      userAgent
    })

    return NextResponse.json({ featureFlag }, { status: 201 })
  } catch (error) {
    console.error('Error creating feature flag:', error)
    return NextResponse.json({ error: 'Failed to create feature flag' }, { status: 500 })
  }
}
