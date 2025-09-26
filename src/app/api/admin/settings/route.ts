import { NextRequest, NextResponse } from 'next/server'
import { auth } from "@/auth"
import { prisma } from '@/lib/prisma'
import { createAuditLog } from '@/lib/audit-log'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic';

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'settings.write')
    if (guard) return guard

    const settings = await prisma.systemSetting.findMany({
      orderBy: { key: 'asc' },
    })

    return NextResponse.json({ settings })
  } catch (error) {
    console.error('Error fetching settings:', error)
    return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 })
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'settings.write')
    if (guard) return guard

    const { key, value } = await request.json()

    if (!key || value === undefined) {
      return NextResponse.json({ error: 'Key and value required' }, { status: 400 })
    }

    const updatedSetting = await prisma.systemSetting.update({
      where: { key },
      data: { value },
    })

    // Audit log
    const clientIP = request.headers.get('x-forwarded-for') || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'
    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UPDATE',
      resourceType: 'system_setting',
      resourceId: key,
      oldValues: undefined,
      newValues: { value },
      permission: 'settings.write',
      reason: 'System setting update',
      permissionSnapshot: { permissions: ['settings.write'] },
      ipAddress: clientIP,
      userAgent,
    })

    return NextResponse.json({ setting: updatedSetting })
  } catch (error) {
    console.error('Error updating setting:', error)
    return NextResponse.json({ error: 'Failed to update setting' }, { status: 500 })
  }
}
