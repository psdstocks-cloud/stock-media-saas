import { NextRequest, NextResponse } from 'next/server';
import { adminAuthOptions } from '@/lib/auth/adminAuthOptions';

export async function GET(request: NextRequest) {
  try {
    // Test if adminAuthOptions is valid
    const hasSecret = !!adminAuthOptions.secret;
    const hasProviders = adminAuthOptions.providers?.length > 0;
    const hasAdapter = !!adminAuthOptions.adapter;
    
    return NextResponse.json({
      success: true,
      config: {
        hasSecret,
        hasProviders,
        hasAdapter,
        providerCount: adminAuthOptions.providers?.length || 0,
        secretLength: adminAuthOptions.secret?.length || 0,
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
