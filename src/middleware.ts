import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define your session cookie names
const USER_COOKIE_NAME = '__Secure-user-session-token'
const ADMIN_COOKIE_NAME = '__Secure-admin-session-token'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl
  
  const userCookie = req.cookies.get(USER_COOKIE_NAME)
  const adminCookie = req.cookies.get(ADMIN_COOKIE_NAME)

  console.log('Dual Auth Middleware check:', { 
    pathname, 
    hasUserCookie: !!userCookie,
    hasAdminCookie: !!adminCookie,
    isAdminPath: pathname.startsWith('/admin'),
    isUserPath: pathname.startsWith('/dashboard')
  })

  // --- Logic for Admin Panel ---
  if (pathname.startsWith('/admin')) {
    // If user is trying to access an admin route but is not logged in as an admin,
    // redirect them to the admin login page.
    if (!adminCookie) {
      console.log('No admin cookie, redirecting to admin login')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // --- Logic for User Panel ---
  else if (pathname.startsWith('/dashboard')) {
    // If user is trying to access a protected user route but is not logged in,
    // redirect them to the user login page.
    if (!userCookie) {
      console.log('No user cookie, redirecting to user login')
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // --- Edge Case Handling ---
  // If a logged-in admin visits the user login page, redirect them to the admin dashboard.
  if (adminCookie && pathname === '/login') {
    console.log('Admin user accessing regular login, redirecting to admin dashboard')
    return NextResponse.redirect(new URL('/admin', req.url))
  }
  // If a logged-in user visits the admin login page, redirect them to their dashboard.
  if (userCookie && pathname === '/admin/login') {
    console.log('User accessing admin login, redirecting to user dashboard')
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  // If all checks pass, allow the request to proceed.
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