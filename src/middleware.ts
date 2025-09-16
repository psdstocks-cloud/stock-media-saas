// src/middleware.ts
import { NextRequest } from 'next/server';
import { auth as userAuth } from '@/lib/auth-user';
import { getAdminUserFromToken, isAdminUser } from '@/lib/admin-auth-helper';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for login pages to prevent redirect loops
  if (pathname === '/admin/login' || pathname === '/login') {
    return;
  }

  if (pathname.startsWith('/admin')) {
    const adminUser = getAdminUserFromToken(req);
    if (!isAdminUser(adminUser)) {
      return Response.redirect(new URL('/admin/login', req.url));
    }
  }

  if (pathname.startsWith('/dashboard')) {
    const session = await userAuth();
    if (!session) {
      return Response.redirect(new URL('/login', req.url));
    }
  }
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};