// This is now the single source of truth for this type
export type UserWithStatus = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
  lockedUntil: Date | null
  isSuspended: boolean
}
