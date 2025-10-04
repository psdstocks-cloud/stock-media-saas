'use client'

import { ReactNode } from 'react'

interface AuthProviderProps {
  children: ReactNode
}

export function AuthProvider({ children }: AuthProviderProps) {
  // Custom authentication provider - no longer using NextAuth
  return <>{children}</>
}
