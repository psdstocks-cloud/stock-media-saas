import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const PERMISSIONS = [
  'orders.view', 'orders.manage', 'orders.refund',
  'users.view', 'users.edit', 'users.impersonate',
  'points.adjust',
  'billing.view',
  'flags.view', 'flags.manage',
  'webhooks.view', 'webhooks.replay',
  'analytics.view',
  'settings.write',
  'approvals.manage',
]

const ROLES: Record<string, string[]> = {
  SUPER_ADMIN: PERMISSIONS,
  Ops: ['orders.view','orders.manage','flags.view','flags.manage','webhooks.view','webhooks.replay','analytics.view'],
  Support: ['orders.view','users.view','users.impersonate','webhooks.view','analytics.view'],
  Finance: ['billing.view','points.adjust','orders.refund','analytics.view','approvals.manage'],
  Content: ['flags.view','analytics.view'],
  Analyst: ['analytics.view'],
}

async function main() {
  // Upsert permissions
  const permissionMap: Record<string, string> = {}
  for (const key of PERMISSIONS) {
    const p = await prisma.permission.upsert({
      where: { key },
      update: {},
      create: { key },
    })
    permissionMap[key] = p.id
  }

  // Upsert roles and attach permissions
  for (const [roleName, permKeys] of Object.entries(ROLES)) {
    const role = await prisma.role.upsert({
      where: { name: roleName },
      update: {},
      create: { name: roleName },
    })
    // attach permissions
    for (const key of permKeys) {
      await prisma.rolePermission.upsert({
        where: { roleId_permissionId: { roleId: role.id, permissionId: permissionMap[key] } },
        update: {},
        create: { roleId: role.id, permissionId: permissionMap[key] },
      })
    }
  }

  // Map existing admins
  const admins = await prisma.user.findMany({ where: { OR: [ { role: 'ADMIN' }, { role: 'SUPER_ADMIN' } ] }, select: { id: true, role: true } })
  const superAdminRole = await prisma.role.findUnique({ where: { name: 'SUPER_ADMIN' } })
  const opsRole = await prisma.role.findUnique({ where: { name: 'Ops' } })
  const supportRole = await prisma.role.findUnique({ where: { name: 'Support' } })

  for (const u of admins) {
    if (u.role === 'SUPER_ADMIN' && superAdminRole) {
      await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: superAdminRole.id } }, update: {}, create: { userId: u.id, roleId: superAdminRole.id } })
    } else if (u.role === 'ADMIN' && opsRole && supportRole) {
      await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: opsRole.id } }, update: {}, create: { userId: u.id, roleId: opsRole.id } })
      await prisma.userRole.upsert({ where: { userId_roleId: { userId: u.id, roleId: supportRole.id } }, update: {}, create: { userId: u.id, roleId: supportRole.id } })
    }
  }
}

main().then(() => prisma.$disconnect()).catch(async (e) => { console.error(e); await prisma.$disconnect(); process.exit(1); })


