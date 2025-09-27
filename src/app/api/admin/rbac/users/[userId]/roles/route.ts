import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const { userId } = await params
  const roles = await prisma.userRole.findMany({ where: { userId }, include: { role: true } })
  return NextResponse.json({ roles: roles.map(r => ({ id: r.role.id, name: r.role.name })) })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { userId } = await params
    const body = await request.json()
    const roleIds: string[] = Array.isArray(body.roleIds) ? body.roleIds : []

    const before = await prisma.userRole.findMany({ where: { userId }, include: { role: true } })
    await prisma.userRole.deleteMany({ where: { userId } })
    for (const roleId of roleIds) {
      await prisma.userRole.create({ data: { userId, roleId } })
    }
    const after = await prisma.userRole.findMany({ where: { userId }, include: { role: true } })

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UPDATE',
      resourceType: 'user_role',
      resourceId: userId,
      oldValues: { roles: before.map(r => r.role.name) },
      newValues: { roles: after.map(r => r.role.name) },
      permission: 'rbac.manage',
      reason: 'Set user roles',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to set user roles' }, { status: 500 })
  }
}
