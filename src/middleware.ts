// src/middleware.ts
import { auth } from '@/lib/auth';
import { NextResponse } from 'next/server';

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const isLoggedIn = !!req.auth;

  if (pathname.startsWith('/admin') && (!isLoggedIn || (req.auth?.user.role !== 'ADMIN' && req.auth?.user.role !== 'SUPER_ADMIN'))) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }

  if (pathname.startsWith('/dashboard') && !isLoggedIn) {
    return NextResponse.redirect(new URL('/login', req.nextUrl));
  }
});

export const config = {
  matcher: ['/admin/:path*', '/dashboard/:path*'],
};