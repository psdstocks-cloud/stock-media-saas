import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(req) {
    const { pathname } = req.nextUrl
    const token = req.nextauth.token

    console.log('Middleware check:', { pathname, hasToken: !!token, role: token?.role })

    // Admin route protection - redirect to admin login if no token
    if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
      if (!token) {
        console.log('No token, redirecting to admin login')
        return NextResponse.redirect(new URL('/admin/login', req.url))
      }
      
      // Check if user has admin role
      if (token.role !== 'ADMIN' && token.role !== 'SUPER_ADMIN') {
        console.log('Not admin role, redirecting to dashboard')
        return NextResponse.redirect(new URL('/dashboard', req.url))
      }
    }

    // Redirect admin users from regular login to admin login
    if (pathname === '/login' && token?.role === 'ADMIN') {
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        const { pathname } = req.nextUrl
        
        // Allow access to public routes
        if (pathname.startsWith('/api/auth') || 
            pathname === '/' ||
            pathname === '/register' ||
            pathname === '/login' ||
            pathname === '/admin/login' ||
            pathname.startsWith('/about') ||
            pathname.startsWith('/contact') ||
            pathname.startsWith('/blog') ||
            pathname.startsWith('/careers') ||
            pathname.startsWith('/reviews') ||
            pathname.startsWith('/terms') ||
            pathname.startsWith('/privacy')) {
          return true
        }

        // Require authentication for protected routes
        if (pathname.startsWith('/dashboard')) {
          return !!token
        }
        
        // Admin routes - always require authentication
        if (pathname.startsWith('/admin') && pathname !== '/admin/login') {
          return !!token
        }

        return true
      },
    },
  }
)

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/admin/:path*',
    '/api/orders/:path*',
    '/api/points/:path*',
    '/api/subscriptions/:path*'
  ]
}
