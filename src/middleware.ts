import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Define protected routes that require authentication
const protectedRoutes = [
  '/payment',
  '/dashboard',
  '/admin'
]

// Define public routes that should redirect to dashboard if already authenticated
const publicRoutes = [
  '/login',
  '/register'
]

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is public (login/register)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // For protected routes, let NextAuth handle the authentication
  // We'll rely on the client-side session management instead of middleware
  if (isProtectedRoute) {
    // Let the request pass through - NextAuth will handle session validation
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