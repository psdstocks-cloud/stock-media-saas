import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

async function main() {
  const prisma = new PrismaClient()
  const email = process.env.SUPER_ADMIN_EMAIL || 'admin@stockmediapro.com'
  const password = process.env.SUPER_ADMIN_PASSWORD || 'Admin!2025#SaaS'

  try {
    const hash = await bcrypt.hash(password, 10)

    const existing = await prisma.user.findUnique({ where: { email: email.toLowerCase() } })

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          role: 'SUPER_ADMIN',
          password: hash,
          emailVerified: new Date(),
          loginAttempts: 0,
          lockedUntil: null,
        },
      })
      console.log(`[OK] Updated existing SUPER_ADMIN: ${email}`)
    } else {
      await prisma.user.create({
        data: {
          email: email.toLowerCase(),
          role: 'SUPER_ADMIN',
          password: hash,
          emailVerified: new Date(),
        },
      })
      console.log(`[OK] Created SUPER_ADMIN: ${email}`)
    }
  } catch (e) {
    console.error('[ERR] Failed to create SUPER_ADMIN:', e)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
