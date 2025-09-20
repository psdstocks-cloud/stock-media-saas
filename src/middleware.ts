// src/middleware.ts
import { NextRequest, NextResponse } from 'next/server';
import { verifyJWT } from '@/lib/jwt-auth';

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  // Get the auth token from cookies
  const token = req.cookies.get('auth-token')?.value;
  let user = null;
  
  if (token) {
    try {
      user = verifyJWT(token);
    } catch (error) {
      // Invalid token, treat as not authenticated
      user = null;
    }
  }

  const isLoggedIn = !!user;

  // Allow access to admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Allow access to regular login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin')) {
    if (!isLoggedIn || (user?.role !== 'admin' && user?.role !== 'ADMIN' && user?.role !== 'SUPER_ADMIN')) {
      const loginUrl = new URL('/admin/login', req.url);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};