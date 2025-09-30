// FILE: src/auth.ts
import CredentialsProvider from 'next-auth/providers/credentials';
import { PrismaAdapter } from '@auth/prisma-adapter';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

// Define the base URL dynamically
const _BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || `https://${process.env.VERCEL_URL}`;

// Initialize NextAuth with error handling
const nextAuthConfig = {
  adapter: PrismaAdapter(prisma),
  secret: process.env.NEXTAUTH_SECRET,
  session: { strategy: 'jwt' as const },
  // Add NEXTAUTH_URL for proper redirects
  ...(process.env.NEXTAUTH_URL && { url: process.env.NEXTAUTH_URL }),
  // Improve client-side stability
  debug: process.env.NODE_ENV === 'development',
  providers: [
    // Temporarily disabled OAuth providers until environment variables are set up
    // GoogleProvider({
    //   clientId: process.env.GOOGLE_CLIENT_ID!,
    //   clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
    // }),
    // FacebookProvider({
    //   clientId: process.env.FACEBOOK_CLIENT_ID!,
    //   clientSecret: process.env.FACEBOOK_CLIENT_SECRET!,
    // }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;

        const user = await prisma.user.findUnique({
          where: { email: (credentials.email as string).toLowerCase() },
        });

        if (!user || !user.password) return null;
        
        const isValid = await bcrypt.compare(credentials.password as string, user.password);
        if (isValid) {
          // On successful password login, update the last login time
          await prisma.user.update({
            where: { id: user.id },
            data: { lastLoginAt: new Date() },
          });
          return user;
        }

        return null;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.role = token.role as string;
      }
      return session;
    },
  },
  pages: {
    signIn: '/login',
    error: '/login', // Redirect all auth errors to the main login page
  },
  // Use the dynamic URL for NextAuth
  basePath: '/api/auth',
  trustHost: true, // Required for Vercel deployment
};

// Use dynamic import to work around TypeScript issues with NextAuth beta
// @ts-ignore - NextAuth v5 beta has TypeScript issues with Next.js 15
import NextAuth from 'next-auth';

// @ts-ignore - Suppress type checking for NextAuth initialization
export const { handlers, auth, signIn, signOut } = NextAuth(nextAuthConfig);

// Export GET and POST for NextAuth routes
export const GET = handlers.GET;
export const POST = handlers.POST;