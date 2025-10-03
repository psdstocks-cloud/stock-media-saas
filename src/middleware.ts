import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/payment',
  '/dashboard'
]

// Define admin routes that require admin authentication
const adminRoutes = [
  '/admin/dashboard',
  '/admin/users',
  '/admin/orders',
  '/admin/settings'
]

// Define public routes that should redirect to dashboard if already authenticated
const publicRoutes = [
  '/login',
  '/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Skip middleware for admin login page to prevent loops
  if (pathname.startsWith('/admin/login')) {
    return NextResponse.next()
  }
  
  // For admin routes, let the client-side authentication guard handle it
  // This prevents middleware from interfering with the authentication flow
  if (adminRoutes.some(route => pathname.startsWith(route))) {
    return NextResponse.next()
  }
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is public (login/register)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // For protected routes, let NextAuth handle the authentication
  // We'll rely on the client-side session management instead of middleware
  if (isProtectedRoute) {
    return NextResponse.next()
  }

  // For public routes, also let them pass through
  // The client-side components will handle redirects based on session state
  if (isPublicRoute) {
    return NextResponse.next()
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
}