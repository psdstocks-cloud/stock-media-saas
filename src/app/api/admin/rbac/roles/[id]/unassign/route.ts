import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await auth()
    const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
    if (guard) return guard

    const { id } = await params
    const body = await request.json()
    const userIds: string[] = Array.isArray(body.userIds) ? body.userIds : []

    await prisma.userRole.deleteMany({ where: { roleId: id, userId: { in: userIds } } })

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UNASSIGN',
      resourceType: 'user_role',
      resourceId: id,
      newValues: { userIds },
      permission: 'rbac.manage',
      reason: 'Unassign users from role',
    })

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to unassign users' }, { status: 500 })
  }
}
