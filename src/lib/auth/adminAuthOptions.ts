import { type NextAuthConfig } from 'next-auth';
import { PrismaAdapter } from '@auth/prisma-adapter';
import CredentialsProvider from 'next-auth/providers/credentials';
import { prisma } from '../prisma';
import bcrypt from 'bcryptjs';

export const adminAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
  adapter: PrismaAdapter(prisma),
  cookies: {
    sessionToken: {
      name: `__Secure-admin-session-token`,
    },
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          console.log('❌ Missing credentials');
          return null;
        }
        
        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user) {
          console.log('❌ User not found:', credentials.email);
          return null;
        }

        if (!user.password) {
          console.log('❌ User has no password set');
          return null;
        }

        if (user.role !== 'ADMIN' && user.role !== 'SUPER_ADMIN') {
          console.log('❌ User is not admin:', user.role);
          return null;
        }
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (isValid) {
          console.log('✅ Admin login successful:', user.email);
          return user;
        }
        
        console.log('❌ Invalid password for:', credentials.email);
        return null;
      },
    }),
  ],
  session: { strategy: 'jwt' },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/admin/login',
  },
} satisfies NextAuthConfig;