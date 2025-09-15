import NextAuth from 'next-auth';
import { userAuthOptions } from './userAuthOptions';

const handler = NextAuth(userAuthOptions);

export const { auth, signIn, signOut } = handler;
export const { GET, POST } = handler;