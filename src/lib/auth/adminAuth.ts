import NextAuth, { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../prisma'
import { sendVerificationRequest } from './sendVerificationRequest'
import { validateEnvironmentVariables } from './env-validation'

// Validate environment variables on startup
try {
  validateEnvironmentVariables()
} catch (error) {
  console.error('Environment validation failed:', error)
}

export const adminAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only-do-not-use-in-production',
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: process.env.EMAIL_SERVER_HOST,
        port: parseInt(process.env.EMAIL_SERVER_PORT || '587'),
        auth: {
          user: process.env.EMAIL_SERVER_USER,
          pass: process.env.EMAIL_SERVER_PASSWORD,
        },
      },
      from: process.env.EMAIL_FROM,
      sendVerificationRequest,
      maxAge: 10 * 60, // 10 minutes
    })
  ],
  session: {
    strategy: 'jwt'
  },
  cookies: {
    sessionToken: {
      name: `__Secure-admin-session-token`,
      options: {
        httpOnly: true,
        sameSite: 'lax',
        path: '/',
        secure: process.env.NODE_ENV === 'production',
      },
    },
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow email provider for admin authentication
      if (account?.provider === 'email') {
        // Verify the user has admin role
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true }
          })
          
          if (!dbUser || (dbUser.role !== 'ADMIN' && dbUser.role !== 'SUPER_ADMIN')) {
            console.warn('Email login attempt by non-admin user:', {
              email: user.email,
              role: dbUser?.role,
              timestamp: new Date().toISOString()
            })
            return false
          }
          
          return true
        } catch (error) {
          console.error('Admin email auth error:', error)
          return false
        }
      }

      // Block other providers for admin authentication
      console.warn('Non-email provider blocked for admin authentication:', account?.provider)
      return false
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        token.email = user.email
        token.name = user.name
      }
      return token
    },
    async redirect({ url, baseUrl }) {
      // Always redirect admin users to admin dashboard
      if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/admin`
    }
  },
}

// Initialize NextAuth with admin configuration and export admin-specific methods
const adminAuth = NextAuth(adminAuthOptions)

export const { auth, signIn, signOut } = adminAuth
export const { GET, POST } = adminAuth
