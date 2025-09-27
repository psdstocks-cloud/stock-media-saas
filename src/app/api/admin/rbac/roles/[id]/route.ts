import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const role = await prisma.role.findUnique({ where: { id } })
  if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })
  return NextResponse.json({ role })
}

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { id } = await params
    const { name, description } = await request.json()

    const before = await prisma.role.findUnique({ where: { id } })
    if (!before) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    const after = await prisma.role.update({ where: { id }, data: { name: name ?? before.name, description } })

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UPDATE',
      resourceType: 'role',
      resourceId: id,
      oldValues: { name: before.name, description: before.description },
      newValues: { name: after.name, description: after.description },
      permission: 'rbac.manage',
      reason: 'Update role meta',
    })

    return NextResponse.json({ role: after })
  } catch (e: any) {
    if (e?.code === 'P2002') {
      return NextResponse.json({ error: 'Role name must be unique' }, { status: 409 })
    }
    return NextResponse.json({ error: 'Failed to update role' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { id } = await params
    const role = await prisma.role.findUnique({ where: { id }, include: { users: true } })
    if (!role) return NextResponse.json({ error: 'Not found' }, { status: 404 })

    // Guard against deleting SUPER_ADMIN role
    if (role.name === 'SUPER_ADMIN') {
      return NextResponse.json({ error: 'Cannot delete SUPER_ADMIN role' }, { status: 400 })
    }

    await prisma.role.delete({ where: { id } })

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'DELETE',
      resourceType: 'role',
      resourceId: id,
      oldValues: { name: role.name },
      permission: 'rbac.manage',
      reason: 'Delete role',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to delete role' }, { status: 500 })
  }
}
