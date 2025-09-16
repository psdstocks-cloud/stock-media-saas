export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    console.log('🔍 Testing admin login with:', { email, password: '***' });

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role } : 'Not found');

    if (!user || !user.password) {
      return NextResponse.json({
        success: false,
        message: 'User not found or no password',
        debug: { user: user ? { id: user.id, email: user.email, role: user.role } : null }
      });
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      return NextResponse.json({
        success: false,
        message: 'Not an admin user',
        debug: { role: user.role }
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid);

    return NextResponse.json({
      success: isValid,
      message: isValid ? 'Login would succeed' : 'Invalid password',
      debug: {
        user: { id: user.id, email: user.email, role: user.role },
        passwordValid: isValid
      }
    });

  } catch (error) {
    console.error('❌ Admin test error:', error);
    return NextResponse.json({
      success: false,
      message: 'Test failed',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
