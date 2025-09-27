import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

export default async function globalSetup() {
  const prisma = new PrismaClient()
  try {
    // Ensure seed ran
    // Create or update SUPER_ADMIN
    const adminEmail = process.env.E2E_ADMIN_EMAIL || 'admin@example.com'
    const adminPass = process.env.E2E_ADMIN_PASS || 'Passw0rd!'

    let admin = await prisma.user.findUnique({ where: { email: adminEmail } })
    if (!admin) {
      admin = await prisma.user.create({ data: { email: adminEmail, role: 'SUPER_ADMIN', password: await bcrypt.hash(adminPass, 10), emailVerified: new Date() } })
    } else {
      await prisma.user.update({ where: { id: admin.id }, data: { role: 'SUPER_ADMIN', password: await bcrypt.hash(adminPass, 10), emailVerified: new Date() } })
    }

    // Finance approver (approvals.manage)
    const financeEmail = process.env.E2E_FIN_EMAIL || 'finance@example.com'
    const financePass = process.env.E2E_FIN_PASS || 'Passw0rd!'
    let finance = await prisma.user.findUnique({ where: { email: financeEmail } })
    if (!finance) {
      finance = await prisma.user.create({ data: { email: financeEmail, role: 'ADMIN', password: await bcrypt.hash(financePass, 10), emailVerified: new Date() } })
    }

    // Ensure RBAC role mappings
    const superRole = await prisma.role.upsert({ where: { name: 'SUPER_ADMIN' }, update: {}, create: { name: 'SUPER_ADMIN' } })
    const financeRole = await prisma.role.upsert({ where: { name: 'Finance' }, update: {}, create: { name: 'Finance' } })
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: admin.id, roleId: superRole.id } }, update: {}, create: { userId: admin.id, roleId: superRole.id } })
    await prisma.userRole.upsert({ where: { userId_roleId: { userId: finance.id, roleId: financeRole.id } }, update: {}, create: { userId: finance.id, roleId: financeRole.id } })
  } finally {
    await prisma.$disconnect()
  }
}
