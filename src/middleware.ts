import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Define the new, unique cookie names
const USER_COOKIE_NAME = '__Secure-user-session-token';
const ADMIN_COOKIE_NAME = '__Secure-admin-session-token';

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  
  const userCookie = req.cookies.get(USER_COOKIE_NAME);
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME);

  const isUserLoginPage = pathname === '/login';
  const isAdminLoginPage = pathname === '/admin/login';

  // --- Logic for Admin Panel ---
  if (pathname.startsWith('/admin') && !isAdminLoginPage) {
    if (!adminCookie) {
      return NextResponse.redirect(new URL('/admin/login', req.url));
    }
  }

  // --- Logic for User Panel ---
  else if (pathname.startsWith('/dashboard')) {
    if (!userCookie) {
      return NextResponse.redirect(new URL('/login', req.url));
    }
  }
  
  // --- Redirect already logged-in users ---
  if (adminCookie && isAdminLoginPage) {
    return NextResponse.redirect(new URL('/admin', req.url));
  }
  if (userCookie && isUserLoginPage) {
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