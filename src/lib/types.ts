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

export type UserWithRelations = {
  id: string
  name: string | null
  email: string
  role: string
  createdAt: Date
  lockedUntil: Date | null
  isSuspended: boolean
  pointsBalance?: {
    currentPoints: number
  }
  subscriptions?: Array<{
    status: string
    plan: {
      name: string
    }
  }>
}

export type PointPack = {
  id: string
  name: string
  description: string | null
  price: number
  points: number
  stripePriceId: string
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export type RolloverRecord = {
  id: string
  userId: string
  amount: number
  expiresAt: Date
  createdAt: Date
  user?: {
    id: string
    name: string | null
    email: string
  }
}
