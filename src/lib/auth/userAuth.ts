import NextAuth, { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import GoogleProvider from 'next-auth/providers/google'
import FacebookProvider from 'next-auth/providers/facebook'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from '../prisma'
import bcrypt from 'bcryptjs'

// Helper function to create providers array with optional OAuth providers
const createProviders = () => {
  const providers = []

  // Add Google provider only if environment variables are available
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    providers.push(
      GoogleProvider({
        clientId: process.env.GOOGLE_CLIENT_ID,
        clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      })
    )
  }

  // Add Facebook provider only if environment variables are available
  if (process.env.FACEBOOK_CLIENT_ID && process.env.FACEBOOK_CLIENT_SECRET) {
    providers.push(
      FacebookProvider({
        clientId: process.env.FACEBOOK_CLIENT_ID,
        clientSecret: process.env.FACEBOOK_CLIENT_SECRET,
      })
    )
  }

  // Always add credentials provider
  providers.push(
    CredentialsProvider({
      name: 'credentials',
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
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            image: user.image,
            role: user.role,
          }
        } catch (error) {
          console.error('User Auth authorize error:', error)
          return null
        }
      }
    })
  )

  return providers
}

// Check for build environment - disable adapter during build
const isBuild = process.env.VERCEL_ENV === 'production' || process.env.NODE_ENV === 'production'
const hasDatabase = process.env.DATABASE_URL && !isBuild

export const userAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-for-development-only',
  // Use the adapter only when database is available and not in build
  adapter: hasDatabase ? PrismaAdapter(prisma) : undefined,
  providers: createProviders(),
  session: {
    strategy: 'jwt'
  },
  cookies: {
    sessionToken: {
      name: `__Secure-user-session-token`,
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
      // Enhanced OAuth sign-in validation
      if (account?.provider === 'google' || account?.provider === 'facebook') {
        try {
          // Check if user already exists with this email
          const existingUser = await prisma.user.findUnique({
            where: { email: user.email?.toLowerCase().trim() },
            include: { accounts: true }
          })

          if (existingUser) {
            // Check if this OAuth provider is already linked
            const existingAccount = existingUser.accounts.find(
              acc => acc.provider === account.provider && acc.providerAccountId === account.providerAccountId
            )

            if (existingAccount) {
              // Same OAuth account, allow sign-in
              return true
            }

            // Different OAuth provider or credentials account exists
            console.warn('OAuth sign-in attempt with existing email:', {
              email: user.email,
              provider: account.provider,
              existingProviders: existingUser.accounts.map(acc => acc.provider),
              timestamp: new Date().toISOString()
            })

            // For security, we'll prevent automatic account linking
            // User should manually link accounts or use existing sign-in method
            return false
          }

          // New user, allow sign-in
          return true
        } catch (error) {
          console.error('OAuth sign-in validation error:', error)
          return false
        }
      }

      // For credentials provider, use existing validation
      return true
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
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      return `${baseUrl}/dashboard`
    }
  },
}

// Export the NextAuth handler for the API route
const handler = NextAuth(userAuthOptions)
export { handler as GET, handler as POST }
