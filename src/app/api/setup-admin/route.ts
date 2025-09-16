import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Simple security check - only allow from localhost or with a secret key
    const authHeader = request.headers.get('authorization');
    const secretKey = process.env.SETUP_SECRET || 'admin-setup-2024';
    
    if (authHeader !== `Bearer ${secretKey}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const adminEmail = 'admin@stockmedia.com';
    const adminPassword = 'AdminSecure2024!';
    
    console.log(`Setting up admin user: ${adminEmail}`);
    
    // Hash the password
    const hashedPassword = await bcrypt.hash(adminPassword, 12);
    
    // Find or create admin user
    let admin = await prisma.user.findUnique({
      where: { email: adminEmail }
    });
    
    if (!admin) {
      // Create new admin user
      admin = await prisma.user.create({
        data: {
          email: adminEmail,
          name: 'Admin User',
          password: hashedPassword,
          role: 'SUPER_ADMIN'
        }
      });
      console.log('✅ Admin user created successfully!');
    } else {
      // Update existing user
      admin = await prisma.user.update({
        where: { id: admin.id },
        data: {
          password: hashedPassword,
          role: 'SUPER_ADMIN',
          loginAttempts: 0,
          lockedUntil: null
        }
      });
      console.log('✅ Admin password updated successfully!');
    }
    
    return NextResponse.json({
      success: true,
      message: 'Admin user setup successfully',
      email: adminEmail,
      role: admin.role,
      id: admin.id
    });
    
  } catch (error) {
    console.error('Error setting up admin user:', error);
    return NextResponse.json({
      error: 'Failed to setup admin user',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
