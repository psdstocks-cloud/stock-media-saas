// scripts/activate-all-admins.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function activateAllAdmins() {
  console.log('🔍 Looking for all admin accounts...');

  const adminUsers = await prisma.user.findMany({
    where: {
      OR: [
        { role: 'admin' },
        { role: 'ADMIN' },
        { role: 'SUPER_ADMIN' }
      ]
    },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      emailVerified: true,
      createdAt: true
    }
  });

  if (adminUsers.length === 0) {
    console.log('❌ No admin accounts found.');
    return;
  }

  console.log(`📋 Found ${adminUsers.length} admin account(s):`);
  console.log('');

  for (const user of adminUsers) {
    console.log(`👤 Admin: ${user.name || 'No name'}`);
    console.log(`📧 Email: ${user.email}`);
    console.log(`🔐 Role: ${user.role}`);
    console.log(`✅ Verified: ${user.emailVerified ? 'Yes' : 'No'}`);
    console.log(`📅 Created: ${user.createdAt.toISOString()}`);
    
    if (!user.emailVerified) {
      console.log('🔄 Activating account...');
      
      await prisma.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
          updatedAt: new Date()
        }
      });
      
      console.log('✅ Account activated successfully!');
    } else {
      console.log('✅ Account already activated.');
    }
    
    console.log('---');
  }

  console.log('');
  console.log('🎉 Admin activation process completed!');
  console.log('');
  console.log('📝 Admin Login Credentials:');
  console.log('');
  
  for (const user of adminUsers) {
    console.log(`Email: ${user.email}`);
    if (user.email === 'admin@example.com') {
      console.log('Password: YourStrongPassword123');
    } else if (user.email === 'admin@stockmedia.com') {
      console.log('Password: admin123');
    } else {
      console.log('Password: [Check your admin setup]');
    }
    console.log('');
  }
}

async function main() {
  try {
    await activateAllAdmins();
  } catch (error) {
    console.error('❌ Error activating admin accounts:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
