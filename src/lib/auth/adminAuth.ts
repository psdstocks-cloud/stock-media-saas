import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'

export const adminAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  // Use JWT strategy only - no database adapter needed
  providers: [
    CredentialsProvider({
      name: 'admin-credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email
            }
          })

          if (!user || !user.password) {
            return null
          }

          // Verify password
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password)
          
          if (!isPasswordValid) {
            return null
          }

          // CRITICAL: Only allow users with ADMIN or SUPER_ADMIN roles
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            console.warn('Admin login attempt by non-admin user:', {
              email: user.email,
              role: user.role,
              timestamp: new Date().toISOString()
            })
            return null
          }
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('Admin Auth authorize error:', error)
          return null
        }
      }
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
      // Only allow credentials provider for admin authentication
      if (account?.provider === 'admin-credentials') {
        // Additional role validation is done in the authorize function
        return true
      }
      
      // Block OAuth providers for admin authentication
      console.warn('OAuth provider blocked for admin authentication:', account?.provider)
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
