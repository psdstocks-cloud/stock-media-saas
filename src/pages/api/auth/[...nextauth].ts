import NextAuth from 'next-auth';
import { userAuthOptions } from '@/lib/auth/userAuthOptions';

// This is the correct syntax for an API route in the Pages Router
export default NextAuth(userAuthOptions);
