import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { auth } from '@/auth'

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
  
  // Get session
  const session = await auth()
  const isAuthenticated = !!session?.user

  // Check if the current path is protected
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  
  // Check if the current path is public (login/register)
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))

  // Handle protected routes
  if (isProtectedRoute && !isAuthenticated) {
    // Redirect to login with return URL
    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('redirect', pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Handle public routes when already authenticated
  if (isPublicRoute && isAuthenticated) {
    // Check if there's a redirect parameter
    const redirectUrl = request.nextUrl.searchParams.get('redirect')
    if (redirectUrl) {
      return NextResponse.redirect(new URL(redirectUrl, request.url))
    }
    // Default redirect to dashboard
    return NextResponse.redirect(new URL('/dashboard', request.url))
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