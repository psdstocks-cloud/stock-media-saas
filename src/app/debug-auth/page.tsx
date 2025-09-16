import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export default async function DebugAuth() {
  const session = await auth()
  
  const user = session?.user?.id ? await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, role: true, name: true }
  }) : null

  return (
    <div style={{ padding: '20px', fontFamily: 'monospace' }}>
      <h1>Debug Authentication</h1>
      <h2>Session Data:</h2>
      <pre>{JSON.stringify(session, null, 2)}</pre>
      
      <h2>User Data:</h2>
      <pre>{JSON.stringify(user, null, 2)}</pre>
      
      <h2>Environment:</h2>
      <pre>{JSON.stringify({
        NEXTAUTH_URL: process.env.NEXTAUTH_URL,
        NEXTAUTH_SECRET: process.env.NEXTAUTH_SECRET ? 'Set' : 'Not Set',
        NODE_ENV: process.env.NODE_ENV
      }, null, 2)}</pre>
    </div>
  )
}
