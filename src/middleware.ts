import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Use NextAuth cookie names
const USER_SESSION_COOKIE = '__Secure-user-session-token';
const ADMIN_SESSION_COOKIE = '__Secure-admin-session-token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const userSessionCookie = req.cookies.get(USER_SESSION_COOKIE);
  const adminSessionCookie = req.cookies.get(ADMIN_SESSION_COOKIE);

  const isUserLoginPage = pathname === '/login';
  const isAdminLoginPage = pathname === '/admin/login';

  // --- Logic for Admin Panel ---
  if (pathname.startsWith('/admin') && !isAdminLoginPage) {
    if (!adminSessionCookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // --- Logic for User Panel ---
  else if (pathname.startsWith('/dashboard')) {
    if (!userSessionCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // --- Redirect already logged-in users ---
  if (adminSessionCookie && isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  if (userSessionCookie && isUserLoginPage) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    '/admin/login'
  ],
};