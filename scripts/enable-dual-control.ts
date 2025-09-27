import { PrismaClient } from '@prisma/client'

async function main() {
  const prisma = new PrismaClient()
  try {
    await prisma.systemSetting.upsert({
      where: { key: 'rbac.dualControl' },
      update: { value: 'true', type: 'boolean' },
      create: { key: 'rbac.dualControl', value: 'true', type: 'boolean' },
    })
    console.log('Enabled rbac.dualControl = true')
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
