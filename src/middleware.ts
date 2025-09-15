import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const USER_COOKIE_NAME = '__Secure-user-session-token'
const ADMIN_COOKIE_NAME = '__Secure-admin-session-token'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  const userCookie = req.cookies.get(USER_COOKIE_NAME)
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)

  const isUserLoginPage = pathname === '/login'
  const isAdminLoginPage = pathname === '/admin/login'

  console.log('Dual Auth Middleware check:', { 
    pathname, 
    hasUserCookie: !!userCookie,
    hasAdminCookie: !!adminCookie,
    isAdminLoginPage,
    isUserLoginPage
  })

  // --- Logic for Admin Panel ---
  // Protect all /admin routes EXCEPT the admin login page itself.
  if (pathname.startsWith('/admin') && !isAdminLoginPage) {
    if (!adminCookie) {
      console.log('No admin cookie, redirecting to admin login')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // --- Logic for User Panel ---
  // Protect all /dashboard routes EXCEPT the user login page itself.
  if (pathname.startsWith('/dashboard') && !isUserLoginPage) {
    if (!userCookie) {
      console.log('No user cookie, redirecting to user login')
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // --- Redirect already logged-in users ---
  // If a logged-in admin tries to visit the admin login page, send them to the dashboard.
  if (adminCookie && isAdminLoginPage) {
    console.log('Admin user accessing admin login, redirecting to admin dashboard')
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  // If a logged-in user tries to visit the user login page, send them to their dashboard.
  if (userCookie && isUserLoginPage) {
    console.log('User accessing user login, redirecting to user dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return NextResponse.next()
}

// The matcher should protect your content routes but EXCLUDE login pages.
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    // Edge case: also apply middleware to login pages to handle redirects for already-logged-in users.
    '/login',
    '/admin/login'
  ],
}