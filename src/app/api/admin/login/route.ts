export const runtime = 'nodejs';

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('🔍 Admin login attempt - raw body:', body);
    
    const { email, password } = body;
    console.log('🔍 Admin login attempt:', { email, password: '***' });

    if (!email || !password) {
      console.log('❌ Missing credentials:', { email: !!email, password: !!password });
      return NextResponse.json(
        { 
          success: false,
          message: 'Email and password are required',
          error: 'MISSING_CREDENTIALS'
        },
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
        { 
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Check if user is admin
    if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
      console.log('❌ User is not admin:', user.role);
      return NextResponse.json(
        { 
          success: false,
          message: 'Access denied. Admin privileges required.',
          error: 'ACCESS_DENIED'
        },
        { status: 403 }
      );
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password);
    console.log('🔐 Password valid:', isValid);
    
    if (!isValid) {
      console.log('❌ Invalid password');
      return NextResponse.json(
        { 
          success: false,
          message: 'Invalid email or password',
          error: 'INVALID_CREDENTIALS'
        },
        { status: 401 }
      );
    }

    // Update last login
    try {
      await prisma.user.update({
        where: { id: user.id },
        data: { 
          lastLoginAt: new Date(),
          loginAttempts: 0,
          lockedUntil: null
        },
      });
      console.log('✅ User login data updated');
    } catch (dbError) {
      console.error('❌ Database update failed:', dbError);
      // Continue with login even if update fails
    }

    // Create JWT token for admin session
    const jwtSecret = process.env.NEXTAUTH_SECRET;
    if (!jwtSecret) {
      console.error('❌ NEXTAUTH_SECRET is not set');
      return NextResponse.json(
        { 
          success: false,
          message: 'Server configuration error',
          error: 'JWT_SECRET_MISSING'
        },
        { status: 500 }
      );
    }

    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role,
        name: user.name 
      },
      jwtSecret,
      { expiresIn: '24h' }
    );

    console.log('🎫 JWT token created for user:', user.email);

    // Set HTTP-only cookie with the token
    try {
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

      response.cookies.set('auth-token', token, {
        httpOnly: true,
        secure: false, // Set to false for now to debug
        sameSite: 'lax',
        maxAge: 24 * 60 * 60, // 24 hours
        path: '/',
        domain: undefined // Let browser determine domain
      });

      console.log('✅ Admin login successful, cookie set');
      return response;
    } catch (cookieError) {
      console.error('❌ Cookie setting failed:', cookieError);
      // Return success response even if cookie fails
      return NextResponse.json({ 
        success: true, 
        message: 'Login successful (cookie setting failed)',
        user: {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role
        }
      });
    }

  } catch (error) {
    console.error('Admin login error:', error);
    
    // Provide more specific error information
    let errorMessage = 'Internal server error';
    let errorType = 'INTERNAL_ERROR';
    
    if (error instanceof Error) {
      errorMessage = error.message;
      if (error.message.includes('JWT')) {
        errorType = 'JWT_ERROR';
      } else if (error.message.includes('database') || error.message.includes('prisma')) {
        errorType = 'DATABASE_ERROR';
      } else if (error.message.includes('bcrypt')) {
        errorType = 'PASSWORD_ERROR';
      }
    }
    
    return NextResponse.json(
      { 
        success: false,
        message: errorMessage,
        error: errorType
      },
      { status: 500 }
    );
  }
}
