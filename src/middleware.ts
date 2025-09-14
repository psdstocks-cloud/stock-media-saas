import { getToken } from 'next-auth/jwt'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET })
  const { pathname } = req.nextUrl

  console.log('Middleware check:', { 
    pathname, 
    hasToken: !!token, 
    role: token?.role,
    isAdminPath: pathname.startsWith('/admin')
  })

  // If the user is not logged in (no token)
  if (!token) {
    // If they are trying to access an admin route, redirect to the admin login page
    if (pathname.startsWith('/admin')) {
      console.log('No token, redirecting to admin login')
      const url = new URL('/admin/login', req.url)
      url.searchParams.set('callbackUrl', req.url) // Save where they were going
      return NextResponse.redirect(url)
    }
    
    // For any other protected route, redirect to the normal user login page
    if (pathname.startsWith('/dashboard')) {
      console.log('No token, redirecting to user login')
      const url = new URL('/login', req.url)
      url.searchParams.set('callbackUrl', req.url) // Save where they were going
      return NextResponse.redirect(url)
    }
  }

  // If the user IS logged in, check for authorization
  if (token) {
    const isAdmin = token.role === 'ADMIN' || token.role === 'SUPER_ADMIN'
    
    if (pathname.startsWith('/admin') && !isAdmin) {
      console.log('Not admin role, redirecting to dashboard')
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }
    
    // Redirect admin users from regular login to admin login
    if (pathname === '/login' && isAdmin) {
      console.log('Admin user accessing regular login, redirecting to admin login')
      return NextResponse.redirect(new URL('/admin/login', req.url))
    }
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