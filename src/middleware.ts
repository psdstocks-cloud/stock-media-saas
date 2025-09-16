// src/middleware.ts
import { auth } from '@/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith('/admin') && (!isLoggedIn || (req.auth?.user.role !== 'ADMIN' && req.auth?.user.role !== 'SUPER_ADMIN'))) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    const loginUrl = new URL('/login', req.url);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};