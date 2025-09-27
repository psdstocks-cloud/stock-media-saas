import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/auth'
import { requirePermission } from '@/lib/rbac'
import { getEffectivePermissions } from '@/lib/rbac'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  const session = await auth()
  const guard = await requirePermission(request, session?.user?.id, 'rbac.manage')
  if (guard) return guard

  const { userId } = await params
  const perms = await getEffectivePermissions(userId)
  return NextResponse.json({ permissions: Array.from(perms) })
}
