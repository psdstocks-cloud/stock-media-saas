import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = await prisma.role.findUnique({ where: { id }, include: { permissions: { include: { permission: true } } } })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  const perms = role.permissions.map(rp => rp.permission.key)
  return NextResponse.json({ permissions: perms })
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { id } = await params
    const body = await request.json()
    const list: string[] = Array.isArray(body.permissions) ? body.permissions : []

    const role = await prisma.role.findUnique({ where: { id } })
    if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const allPerms = await prisma.permission.findMany({ where: { key: { in: list } } })

    // Replace set: delete missing, add new
    await prisma.rolePermission.deleteMany({ where: { roleId: id } })
    for (const p of allPerms) {
      await prisma.rolePermission.create({ data: { roleId: id, permissionId: p.id } })
    }

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UPDATE',
      resourceType: 'role_permission',
      resourceId: id,
      newValues: { permissions: list },
      permission: 'rbac.manage',
      reason: 'Set role permissions',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to set permissions' }, { status: 500 })
  }
}
