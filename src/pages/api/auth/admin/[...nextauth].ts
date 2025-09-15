import NextAuth from 'next-auth'
import { adminAuthOptions } from '@/lib/auth/adminAuth'

// This is the correct syntax for the Pages Router
export default NextAuth(adminAuthOptions)
