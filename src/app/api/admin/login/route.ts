export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();
    console.log('🔍 Admin login attempt:', { email, password: '***' });

    if (!email || !password) {
      console.log('❌ Missing credentials');
      return NextResponse.json(
        { message: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user in database
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    console.log('👤 User found:', user ? { id: user.id, email: user.email, role: user.role, hasPassword: !!user.password } : 'Not found');

    if (!user || !user.password) {
      console.log('❌ User not found or no password');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ User is not admin:', user.role);
      return NextResponse.json(
        { message: 'Access denied. Admin privileges required.' },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { message: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { 
        lastLoginAt: new Date(),
        loginAttempts: 0,
        lockedUntil: null
      },
    });

    // Create JWT token for admin session
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      process.env.NEXTAUTH_SECRET!,
      { expiresIn: '24h' }
    );

    console.log('🎫 JWT token created for user:', user.email);

    // Set HTTP-only cookie with the token
    const response = NextResponse.json({ 
      success: true, 
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

    response.cookies.set('admin-token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 24 * 60 * 60, // 24 hours
      path: '/'
    });

    console.log('✅ Admin login successful, cookie set');
    return response;

  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
