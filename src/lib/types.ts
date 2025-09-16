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

export type OrderWithStockSite = {
  id: string
  title: string | null
  cost: number
  status: string
  downloadUrl: string | null
  imageUrl: string | null
  createdAt: string
  stockSite: {
    displayName: string
  }
}
