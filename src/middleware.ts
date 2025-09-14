import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl

  // Get both user and admin session cookies
  const userCookie = req.cookies.get('__Secure-user-session-token')
  const adminCookie = req.cookies.get('__Secure-admin-session-token')

  console.log('Dual Auth Middleware check:', { 
    pathname, 
    hasUserCookie: !!userCookie,
    hasAdminCookie: !!adminCookie,
    isAdminPath: pathname.startsWith('/admin'),
    isUserPath: pathname.startsWith('/dashboard')
  })

  // Logic for Admin Panel routes
  if (pathname.startsWith('/admin')) {
    // Allow access to admin login page without cookie check
    if (pathname === '/admin/login') {
      return NextResponse.next()
    }
    
    // If trying to access admin area without an admin cookie, redirect to admin login
    if (!adminCookie) {
      console.log('No admin cookie, redirecting to admin login')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  }

  // Logic for User Panel routes
  else if (pathname.startsWith('/dashboard')) {
    // If trying to access user dashboard without a user cookie, redirect to user login
    if (!userCookie) {
      console.log('No user cookie, redirecting to user login')
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }
  
  // Allow access to regular login page without cookie check
  else if (pathname === '/login') {
    return NextResponse.next()
  }

  // Redirect admin users from regular login to admin login (only if they have admin cookie)
  if (pathname === '/login' && adminCookie && !userCookie) {
    console.log('Admin user accessing regular login, redirecting to admin login')
    return NextResponse.redirect(new URL('/admin/login', req.url))
  }

  // If all checks pass, continue to the requested page
  return NextResponse.next()
}

// Apply this middleware to all protected routes
export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/login',
    // Add other protected routes here
  ],
}