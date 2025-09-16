export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

import { NextRequest, NextResponse } from 'next/server';
import { auth as adminAuth } from '@/auth';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Debug: Checking auth status...');
    
    // Check what cookies are present
    const cookies = request.cookies.getAll();
    console.log('🍪 All cookies:', cookies.map(c => ({ name: c.name, value: c.value.substring(0, 20) + '...' })));
    
    // Check admin auth
    const adminSession = await adminAuth();
    console.log('👤 Admin session:', adminSession ? { user: adminSession.user?.email, role: adminSession.user?.role } : 'No session');
    
    return NextResponse.json({
      cookies: cookies.map(c => ({ name: c.name, hasValue: !!c.value })),
      adminSession: adminSession ? {
        hasUser: !!adminSession.user,
        userEmail: adminSession.user?.email,
        userRole: adminSession.user?.role
      } : null,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('🔴 Debug auth error:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Unknown error' }, { status: 500 });
  }
}
