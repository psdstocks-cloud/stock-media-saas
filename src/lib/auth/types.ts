export interface AdminUser {
  id: string
  email: string
  name: string | null
  role: 'ADMIN' | 'SUPER_ADMIN'
}

export interface AuthState {
  user: AdminUser | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  accessToken: string
  refreshToken: string
  expiresAt: number
}
