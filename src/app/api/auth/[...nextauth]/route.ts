import NextAuth from 'next-auth'
import { userAuthOptions } from '@/lib/auth/userAuth'

const handler = NextAuth(userAuthOptions)

export { handler as GET, handler as POST }
