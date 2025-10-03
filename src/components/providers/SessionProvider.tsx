'use client'

// Simplified session provider - NextAuth removed
export default function SessionProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
