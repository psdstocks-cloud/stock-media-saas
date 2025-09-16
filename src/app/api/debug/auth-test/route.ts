import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    // Test if auth configuration is valid
    const session = await auth();
    const hasSession = !!session;
    const hasUser = !!session?.user;
    
    return NextResponse.json({
      success: true,
      config: {
        hasSession,
        hasUser,
        userRole: session?.user?.role || null,
        userId: session?.user?.id || null,
      },
      env: {
        hasNextAuthSecret: !!process.env.NEXTAUTH_SECRET,
        nextAuthSecretLength: process.env.NEXTAUTH_SECRET?.length || 0,
        hasDatabaseUrl: !!process.env.DATABASE_URL,
      }
    });
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    }, { status: 500 });
  }
}
