'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AuthSessionProvider({ children }: Props) {
  return (
    <SessionProvider
      // Optimize session management to reduce API calls
      refetchInterval={10 * 60} // 10 minutes (increased from 5)
      refetchOnWindowFocus={false} // Disabled to prevent excessive calls
      refetchWhenOffline={false}
      // Add session storage to prevent unnecessary refetches
      basePath="/api/auth"
    >
      {children}
    </SessionProvider>
  )
}
