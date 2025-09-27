import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { createAuditLog } from '@/lib/audit-log'

export const dynamic = 'force-dynamic'

interface ImportRole { name: string; description?: string; permissions: string[]; users?: string[] }

export async function POST(request: NextRequest) {
  const session = await auth()
  const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
  if (guard) return guard

  const { roles, dryRun } = await request.json()
  if (!Array.isArray(roles)) return NextResponse.json({ error: 'roles must be an array' }, { status: 400 })

  // Validate and compute diffs
  const existing = await prisma.role.findMany({ include: { permissions: { include: { permission: true } }, users: true } })
  const existingByName = new Map(existing.map(r => [r.name, r]))

  const diffs = [] as any[]

  for (const r of roles as ImportRole[]) {
    if (!r.name || !Array.isArray(r.permissions)) {
      return NextResponse.json({ error: `Invalid role entry: ${r.name}` }, { status: 400 })
    }
    const current = existingByName.get(r.name)
    const desiredPerms = new Set(r.permissions)
    const currentPerms = new Set((current?.permissions || []).map(rp => rp.permission.key))

    const addPerms = [...desiredPerms].filter(k => !currentPerms.has(k))
    const removePerms = [...currentPerms].filter(k => !desiredPerms.has(k))

    diffs.push({ role: r.name, create: !current, addPerms, removePerms, setUsers: Array.isArray(r.users) ? r.users.length : undefined })
  }

  if (dryRun) return NextResponse.json({ diffs })

  // Apply
  for (const r of roles as ImportRole[]) {
    let role = await prisma.role.findUnique({ where: { name: r.name } })
    if (!role) role = await prisma.role.create({ data: { name: r.name, description: r.description } })

    // perms
    await prisma.rolePermission.deleteMany({ where: { roleId: role.id } })
    const fullPerms = await prisma.permission.findMany({ where: { key: { in: r.permissions } } })
    for (const p of fullPerms) {
      await prisma.rolePermission.create({ data: { roleId: role.id, permissionId: p.id } })
    }

    // users
    if (Array.isArray(r.users)) {
      await prisma.userRole.deleteMany({ where: { roleId: role.id } })
      for (const uid of r.users) {
        await prisma.userRole.create({ data: { userId: uid, roleId: role.id } })
      }
    }

    await createAuditLog({
      adminId: session!.user!.id,
      action: 'UPDATE',
      resourceType: 'role',
      resourceId: role.id,
      newValues: { imported: true, name: r.name },
      permission: 'rbac.manage',
      reason: 'Import role config',
    })
  }

  return NextResponse.json({ success: true })
}
