import NextAuth from 'next-auth';
import { adminAuthOptions } from './auth/adminAuthOptions';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(adminAuthOptions);