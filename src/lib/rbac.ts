import { prisma } from './prisma'
import { NextRequest, NextResponse } from 'next/server'

export async function getEffectivePermissions(userId: string): Promise<Set<string>> {
  const roles = await prisma.userRole.findMany({
    where: { userId },
    include: { role: { include: { permissions: { include: { permission: true } } } } }
  })
  const set = new Set<string>()
  for (const ur of roles) {
    for (const rp of ur.role.permissions) {
      set.add(rp.permission.key)
    }
  }
  return set
}

export async function hasPermission(userId: string, key: string): Promise<boolean> {
  const eff = await getEffectivePermissions(userId)
  return eff.has(key)
}

export async function requirePermission(request: NextRequest, userId: string | undefined, key: string): Promise<NextResponse | null> {
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  // SUPER_ADMIN bypass via role mapping
  const isSuper = await prisma.userRole.findFirst({ where: { userId, role: { name: 'SUPER_ADMIN' } } })
  if (isSuper) return null
  const allowed = await hasPermission(userId, key)
  if (!allowed) {
    return NextResponse.json({ error: 'Forbidden: missing permission', permission: key }, { status: 403 })
  }
  return null
}
