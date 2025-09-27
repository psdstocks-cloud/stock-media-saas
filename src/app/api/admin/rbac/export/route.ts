import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
  if (guard) return guard

  const { searchParams } = new URL(request.url)
  const includeUsers = searchParams.get('includeUsers') === '1'

  const roles = await prisma.role.findMany({
    include: {
      permissions: { include: { permission: true } },
      users: includeUsers ? { include: { user: true } } : false as any,
    },
    orderBy: { name: 'asc' },
  })

  const exportData = roles.map(r => ({
    name: r.name,
    description: r.description || undefined,
    permissions: r.permissions.map(rp => rp.permission.key).sort(),
    users: includeUsers ? r.users.map(ur => ur.userId) : undefined,
  }))

  return NextResponse.json({ roles: exportData })
}
