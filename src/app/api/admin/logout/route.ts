export const runtime = 'nodejs';

import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const response = NextResponse.json({ 
      success: true, 
      message: 'Logout successful' 
    });

    // Clear the admin token cookie
    response.cookies.set('auth-token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 0, // Expire immediately
      path: '/'
    });

    return response;

  } catch (error) {
    console.error('Admin logout error:', error);
    return NextResponse.json(
      { message: 'Internal server error' },
      { status: 500 }
    );
  }
}
