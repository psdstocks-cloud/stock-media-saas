// src/app/api/admin/feature-flags/[id]/route.ts
// Individual feature flag management

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/lib/auth"
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params

    const featureFlag = await prisma.featureFlag.findUnique({
      where: { id }
    })

    if (!featureFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }

    return NextResponse.json({ featureFlag })
  } catch (error) {
    console.error('Error fetching feature flag:', error)
    return NextResponse.json({ error: 'Failed to fetch feature flag' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params
    const { name, description, isEnabled, rolloutPercentage, targetUsers, conditions } = await request.json()

    // Get current feature flag for audit log
    const currentFeatureFlag = await prisma.featureFlag.findUnique({
      where: { id }
    })

    if (!currentFeatureFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }

    // Check if name is being changed and if it conflicts
    if (name && name !== currentFeatureFlag.name) {
      const existing = await prisma.featureFlag.findUnique({
        where: { name }
      })

      if (existing) {
        return NextResponse.json({ error: 'Feature flag with this name already exists' }, { status: 409 })
      }
    }

    const updatedFeatureFlag = await prisma.featureFlag.update({
      where: { id },
      data: {
        name: name || currentFeatureFlag.name,
        description: description !== undefined ? description : currentFeatureFlag.description,
        isEnabled: isEnabled !== undefined ? isEnabled : currentFeatureFlag.isEnabled,
        rolloutPercentage: rolloutPercentage !== undefined ? rolloutPercentage : currentFeatureFlag.rolloutPercentage,
        targetUsers: targetUsers !== undefined ? JSON.stringify(targetUsers) : currentFeatureFlag.targetUsers,
        conditions: conditions !== undefined ? JSON.stringify(conditions) : currentFeatureFlag.conditions,
        updatedAt: new Date()
      }
    })

    // Create audit log
    const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await createAuditLog({
      adminId: session.user.id,
      action: 'UPDATE',
      resourceType: 'feature_flag',
      resourceId: id,
      oldValues: {
        name: currentFeatureFlag.name,
        isEnabled: currentFeatureFlag.isEnabled,
        rolloutPercentage: currentFeatureFlag.rolloutPercentage
      },
      newValues: {
        name: updatedFeatureFlag.name,
        isEnabled: updatedFeatureFlag.isEnabled,
        rolloutPercentage: updatedFeatureFlag.rolloutPercentage
      },
      ipAddress: clientIP,
      userAgent
    })

    return NextResponse.json({ featureFlag: updatedFeatureFlag })
  } catch (error) {
    console.error('Error updating feature flag:', error)
    return NextResponse.json({ error: 'Failed to update feature flag' }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await auth()

    if (!session?.user?.id || (session.user.role !== 'ADMIN' && session.user.role !== 'SUPER_ADMIN')) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const { id } = params

    // Get current feature flag for audit log
    const currentFeatureFlag = await prisma.featureFlag.findUnique({
      where: { id }
    })

    if (!currentFeatureFlag) {
      return NextResponse.json({ error: 'Feature flag not found' }, { status: 404 })
    }

    await prisma.featureFlag.delete({
      where: { id }
    })

    // Create audit log
    const clientIP = request.headers.get('x-forwarded-for') || request.ip || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    await createAuditLog({
      adminId: session.user.id,
      action: 'DELETE',
      resourceType: 'feature_flag',
      resourceId: id,
      oldValues: {
        name: currentFeatureFlag.name,
        isEnabled: currentFeatureFlag.isEnabled
      },
      ipAddress: clientIP,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature flag:', error)
    return NextResponse.json({ error: 'Failed to delete feature flag' }, { status: 500 })
  }
}
