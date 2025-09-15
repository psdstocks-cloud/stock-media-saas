import NextAuth, { NextAuthOptions } from 'next-auth'
import EmailProvider from 'next-auth/providers/email'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import { sendVerificationRequest } from './auth/sendVerificationRequest'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  providers: [
    EmailProvider({
      server: {
        host: 'smtp.resend.com',
        port: 587,
        auth: {
          user: 'resend',
          pass: process.env.RESEND_API_KEY,
        },
      },
      from: process.env.EMAIL_FROM || 'Stock Media SaaS <onboarding@resend.dev>',
      sendVerificationRequest,
      maxAge: 10 * 60, // 10 minutes
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/auth/error',
    verifyRequest: '/admin/auth/verify-request',
  },
  callbacks: {
    async signIn({ user, account, profile }) {
      // Only allow email provider for admin authentication
      if (account?.provider === 'email') {
        try {
          const dbUser = await prisma.user.findUnique({
            where: { email: user.email! },
            select: { role: true }
          })

          // Only allow users with ADMIN or SUPER_ADMIN roles
          if (dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN')) {
            return true
          }
          
          return false
        } catch (error) {
          console.error('Admin email auth error:', error)
          return false
        }
      }

      return false
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
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
        session.user.email = token.email as string
        session.user.name = token.name as string
      }
      return session
    },
    async redirect({ url, baseUrl }) {
      // Always redirect admin users to admin dashboard
      if (url.startsWith("/admin")) return `${baseUrl}${url}`
      else if (url.startsWith("/")) return `${baseUrl}${url}`
      else if (new URL(url).origin === baseUrl) return url
      
      return `${baseUrl}/admin`
    }
  },
}

const handler = NextAuth(authOptions)
export { handler as GET, handler as POST }
export const { auth, signIn, signOut } = handler