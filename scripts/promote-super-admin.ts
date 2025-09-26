import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function promote(email: string) {
  if (!email) {
    console.error('Usage: npx tsx scripts/promote-super-admin.ts <email>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })
  if (!user) {
    console.error(`User not found: ${email}`)
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: {
      role: 'SUPER_ADMIN',
      emailVerified: user.emailVerified ? user.emailVerified : new Date(),
      updatedAt: new Date()
    }
  })

  console.log('✅ User promoted to SUPER_ADMIN and verified:')
  console.table({ id: updated.id, email: updated.email, role: updated.role, emailVerified: updated.emailVerified })
}

async function main() {
  try {
    const email = process.argv[2]
    await promote(email)
  } catch (err) {
    console.error('Error promoting user:', err)
  } finally {
    await prisma.$disconnect()
  }
}

main()


