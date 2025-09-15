import { type NextAuthOptions } from 'next-auth';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import EmailProvider from 'next-auth/providers/email';
import { prisma } from '../prisma';
import { sendVerificationRequest } from './sendVerificationRequest';

export const adminAuthOptions: NextAuthOptions = {
  secret: process.env.NEXTAUTH_SECRET,
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
      maxAge: 10 * 60, // 10-minute token validity
      sendVerificationRequest,
    }),
  ],
  session: {
    strategy: 'jwt',
  },
  callbacks: {
    async signIn({ user }) {
      const dbUser = await prisma.user.findUnique({
        where: { email: user.email! },
        select: { role: true },
      });

      if (dbUser && (dbUser.role === 'ADMIN' || dbUser.role === 'SUPER_ADMIN')) {
        return true;
      }
      // Explicitly return false to prevent non-admin sign-ins
      return false;
    },
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = (user as any).role;
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
    async redirect({ baseUrl }) {
      return `${baseUrl}/admin`;
    },
  },
  pages: {
    signIn: '/admin/login',
    error: '/admin/auth/error',
    verifyRequest: '/admin/auth/verify-request',
  },
};
