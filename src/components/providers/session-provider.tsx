'use client'

import { SessionProvider } from 'next-auth/react'
import { ReactNode } from 'react'

interface Props {
  children: ReactNode
}

export default function AuthSessionProvider({ children }: Props) {
  return (
    <SessionProvider
      // Add refetch interval to keep session fresh
      refetchInterval={5 * 60} // 5 minutes
      refetchOnWindowFocus={true}
      refetchWhenOffline={false}
    >
      {children}
    </SessionProvider>
  )
}
