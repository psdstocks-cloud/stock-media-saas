import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const session = await auth()
  const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
  if (guard) return guard

  const permissions = await prisma.permission.findMany({ orderBy: { key: 'asc' } })
  return NextResponse.json({ permissions: permissions.map(p => p.key) })
}
