import { NextRequest, NextResponse } from 'next/server';
import { createJWT } from '@/lib/jwt-auth';

export async function GET(_request: NextRequest) {
  try {
    // Create a test user token using an existing user from the database
    const testUser = {
      id: 'cmfn55y400001l2048qkhyqbl',
      email: 'testuser@example.com',
      name: 'test new',
      role: 'user'
    };

    const token = createJWT(testUser);
    
    return NextResponse.json({
      success: true,
      token,
      user: testUser,
      message: 'Test authentication token created'
    });
  } catch (error) {
    console.error('Test auth error:', error);
    return NextResponse.json({ 
      success: false,
      message: 'Failed to create test token'
    }, { status: 500 });
  }
}
