import NextAuth from 'next-auth';
import { adminAuthOptions } from '@/lib/auth/adminAuthOptions';

// This is the correct syntax for an API route in the Pages Router
export default NextAuth(adminAuthOptions);
