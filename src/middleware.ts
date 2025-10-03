import { auth } from '@/lib/auth-config'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export default auth((req) => {
  const { pathname } = req.nextUrl
  const { auth } = req

  // Admin routes require admin role
  if (pathname.startsWith('/admin')) {
    if (!auth || auth.user?.role !== 'ADMIN' && auth.user?.role !== 'SUPER_ADMIN') {
      return NextResponse.redirect(new URL('/admin/auth/signin', req.url))
    }
  }

  // Dashboard routes require authentication
  if (pathname.startsWith('/dashboard')) {
    if (!auth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  // Payment routes require authentication
  if (pathname.startsWith('/payment')) {
    if (!auth) {
      return NextResponse.redirect(new URL('/login', req.url))
    }
  }

  return NextResponse.next()
})

export const config = {
  matcher: [
    '/admin/:path*',
    '/dashboard/:path*',
    '/payment/:path*'
  ]
}