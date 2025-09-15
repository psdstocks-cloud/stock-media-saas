import NextAuth from 'next-auth';
import { adminAuthOptions } from './adminAuthOptions';

const handler = NextAuth(adminAuthOptions);

export const { auth, signIn, signOut } = handler;
export const { GET, POST } = handler;
