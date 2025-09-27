import { prisma } from '@/lib/prisma'

export async function isEnforced(area: string): Promise<boolean> {
  const envOverride = process.env[`NEXT_PUBLIC_RBAC_ENFORCE_${area.toUpperCase()}`]
  if (envOverride !== undefined) return envOverride === '1' || envOverride === 'true'
  try {
    const key = `rbac.enforce.${area}`
    const s = await prisma.systemSetting.findUnique({ where: { key } })
    return s?.value === 'true'
  } catch {
    return false
  }
}
