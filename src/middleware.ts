// src/middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  // Allow access to admin login page without authentication
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // Allow access to regular login page without authentication
  if (pathname === '/login') {
    return NextResponse.next();
  }

  // Protect admin routes (except login)
  if (pathname.startsWith('/admin') && (!isLoggedIn || (req.auth?.user.role !== 'admin' && req.auth?.user.role !== 'ADMIN' && req.auth?.user.role !== 'SUPER_ADMIN'))) {
    const loginUrl = new URL('/admin/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  // Protect dashboard routes
  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};