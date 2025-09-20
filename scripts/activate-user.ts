// scripts/activate-user.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateUser(email: string) {
  if (!email) {
    console.error('Please provide an email address.');
    process.exit(1);
  }

  console.log(`🔍 Looking for user with email: ${email}`);

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    console.error(`❌ User with email "${email}" not found.`);
    process.exit(1);
  }

  console.log(`👤 Found user:`, {
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    emailVerified: user.emailVerified ? 'Already verified' : 'Not verified'
  });

  if (user.emailVerified) {
    console.log(`✅ User "${email}" is already activated.`);
    return;
  }

  await prisma.user.update({
    where: { email },
    data: {
      emailVerified: new Date(),
      updatedAt: new Date()
    },
  });

  console.log(`✅ User "${email}" has been successfully activated.`);
  console.log(`📧 Email verification timestamp: ${new Date().toISOString()}`);
}

async function main() {
  try {
    const emailToActivate = process.argv[2];
    
    if (!emailToActivate) {
      console.error('Usage: npm run tsx -- scripts/activate-user.ts <email>');
      console.error('Example: npm run tsx -- scripts/activate-user.ts admin@example.com');
      process.exit(1);
    }

    await activateUser(emailToActivate);
  } catch (error) {
    console.error('❌ Error activating user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
