// src/middleware.ts
import { NextRequest } from 'next/server';
import { auth as adminAuth } from '@/lib/auth-admin';
import { auth as userAuth } from '@/lib/auth-user';

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Skip middleware for login pages to prevent redirect loops
  if (pathname === '/admin/login' || pathname === '/login') {
    return;
  }

  if (pathname.startsWith('/admin')) {
    const session = await adminAuth();
    if (!session) {
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