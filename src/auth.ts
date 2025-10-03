// FILE: src/auth.ts
import NextAuth from 'next-auth'
import { authOptions } from '@/lib/auth-config'

export const { handlers, auth, signIn, signOut } = NextAuth(authOptions)

// Export GET and POST for NextAuth routes
export const GET = handlers.GET
export const POST = handlers.POST