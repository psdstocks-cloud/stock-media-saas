import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export const authOptions = {
  session: { strategy: 'jwt' as const },
  secret: process.env.NEXTAUTH_SECRET,
  debug: process.env.NODE_ENV === 'development',
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        try {
          console.log('🔍 Auth: Attempting login for:', credentials?.email)
          
          if (!credentials?.email || !credentials?.password) {
            console.log('❌ Auth: Missing credentials')
            return null
          }

          const user = await prisma.user.findUnique({
            where: { email: (credentials.email as string).toLowerCase() }
          })

          if (!user || !user.password) {
            console.log('❌ Auth: User not found or no password')
            return null
          }

          const passwordMatch = await bcrypt.compare(credentials.password as string, user.password)
          
          if (!passwordMatch) {
            console.log('❌ Auth: Password mismatch')
            return null
          }

          // Check if user has admin privileges
          if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
            console.log('❌ Auth: User does not have admin privileges:', user.role)
            return null
          }

          console.log('✅ Auth: Login successful for admin:', user.email)
          
          return {
            id: user.id,
            email: user.email,
            name: user.name,
            role: user.role,
          }
        } catch (error) {
          console.error('❌ Auth: Login error:', error)
          return null
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id
        token.role = user.role
      }
      return token
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user && token) {
        session.user.id = token.id as string
        session.user.role = token.role as string
      }
      return session
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      console.log('🔄 Auth: Redirect called with url:', url, 'baseUrl:', baseUrl)
      
      // Allows relative callback URLs
      if (url.startsWith("/")) return `${baseUrl}${url}`
      // Allows callback URLs on the same origin
      else if (new URL(url).origin === baseUrl) return url
      // Default redirect to admin dashboard
      return `${baseUrl}/admin/dashboard`
    }
  },
  pages: {
    signIn: '/admin/auth/signin',
    error: '/admin/auth/error',
  },
}
