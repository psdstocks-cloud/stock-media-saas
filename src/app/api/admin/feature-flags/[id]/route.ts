// src/app/api/admin/feature-flags/[id]/route.ts
// Individual feature flag management

import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; // Use Node.js runtime for Prisma and other Node.js APIs

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'flags.view')
    if (guard) return guard
    
    // Ensure id exists and is a string
    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
    }

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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'flags.manage')
    if (guard) return guard

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
    }
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
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown' || 'unknown'
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
      permission: 'flags.manage',
      reason: 'Update feature flag',
      permissionSnapshot: { permissions: ['flags.manage'] },
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'flags.manage')
    if (guard) return guard

    const { id } = await params;
    if (!id) {
        return NextResponse.json({ error: 'ID parameter is missing' }, { status: 400 });
    }

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
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown' || 'unknown'
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
      permission: 'flags.manage',
      reason: 'Delete feature flag',
      permissionSnapshot: { permissions: ['flags.manage'] },
      ipAddress: clientIP,
      userAgent
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting feature flag:', error)
    return NextResponse.json({ error: 'Failed to delete feature flag' }, { status: 500 })
  }
}