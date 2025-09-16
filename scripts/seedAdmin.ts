// scripts/seedAdmin.ts
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'admin@stockmedia.com';
const ADMIN_PASSWORD = 'AdminSecure2024!'; // Updated to match the password you're using

async function main() {
  console.log('Seeding admin user...');

  const existingAdmin = await prisma.user.findUnique({
    where: { email: ADMIN_EMAIL },
  });

  if (existingAdmin) {
    console.log('Admin user already exists. Updating password...');
    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);
    await prisma.user.update({
      where: { email: ADMIN_EMAIL },
      data: { password: hashedPassword },
    });
    console.log('✅ Admin password updated successfully');
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  const adminUser = await prisma.user.create({
    data: {
      email: ADMIN_EMAIL,
      name: 'Super Admin',
      password: hashedPassword,
      role: 'SUPER_ADMIN',
    },
  });

  console.log('✅ Super Admin user created successfully:');
  console.log(adminUser);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });