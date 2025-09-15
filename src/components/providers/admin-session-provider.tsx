'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AdminSessionProvider({ children }: Props) {
  return (
    <SessionProvider
      // Use admin-specific base path
      basePath="/api/auth/admin"
      refetchInterval={10 * 60} // 10 minutes
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}
