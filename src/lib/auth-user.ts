import NextAuth from 'next-auth';
import { userAuthOptions } from './auth/userAuthOptions';

export const {
  handlers: { GET, POST },
  auth,
  signIn,
  signOut,
} = NextAuth(userAuthOptions);