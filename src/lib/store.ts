import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

// Types
export interface User {
  id: string
  email: string
  name: string
  role: 'user' | 'admin' | 'moderator'
  points: number
  subscriptionPlan?: string
}

export interface SearchFilters {
  category: string[]
  color: string[]
  orientation: 'landscape' | 'portrait' | 'square' | ''
  size: 'small' | 'medium' | 'large' | ''
  dateRange: [Date, Date] | null
  priceRange: [number, number] | null
  license: 'free' | 'premium' | 'exclusive' | ''
}

export interface MediaItem {
  id: string
  site: string
  title: string
  url: string
  imageUrl: string
  cost: number
  description: string
  tags: string[]
  dimensions?: {
    width: number
    height: number
  }
}

export interface CartItem extends MediaItem {
  quantity: number
  addedAt: Date
}

// App State Interface
interface AppState {
  // User state
  user: User | null
  isAuthenticated: boolean
  
  // Search state
  searchQuery: string
  searchFilters: SearchFilters
  searchResults: MediaItem[]
  isSearching: boolean
  
  // Cart state
  cart: CartItem[]
  cartTotal: number
  
  // UI state
  viewMode: 'grid' | 'list'
  selectedMedia: MediaItem[]
  sidebarOpen: boolean

  // Notifications
  notifications: Array<{
    id: string
    title: string
    body?: string
    href?: string
    cta?: string
    createdAt: number
  }>
  
  // Actions
  setUser: (user: User | null) => void
  setSearchQuery: (query: string) => void
  setSearchFilters: (filters: Partial<SearchFilters>) => void
  setSearchResults: (results: MediaItem[]) => void
  setIsSearching: (isSearching: boolean) => void
  addToCart: (item: MediaItem) => void
  removeFromCart: (itemId: string) => void
  clearCart: () => void
  setViewMode: (mode: 'grid' | 'list') => void
  toggleMediaSelection: (item: MediaItem) => void
  setSidebarOpen: (open: boolean) => void
  updateCartItemQuantity: (itemId: string, quantity: number) => void

  // Notification actions
  addNotification: (n: { id?: string; title: string; body?: string; href?: string; cta?: string }) => void
  clearNotifications: () => void
}

// Store implementation
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, _get) => ({
        // Initial state
        user: null,
        isAuthenticated: false,
        searchQuery: '',
        searchFilters: {
          category: [],
          color: [],
          orientation: '',
          size: '',
          dateRange: null,
          priceRange: null,
          license: ''
        },
        searchResults: [],
        isSearching: false,
        cart: [],
        cartTotal: 0,
        viewMode: 'grid',
        selectedMedia: [],
        sidebarOpen: false,

        // Notifications
        notifications: [],

        // Actions
        setUser: (user) => set({ 
          user, 
          isAuthenticated: !!user 
        }),

        setSearchQuery: (query) => set({ searchQuery: query }),

        setSearchFilters: (filters) => set((state) => ({
          searchFilters: { ...state.searchFilters, ...filters }
        })),

        setSearchResults: (results) => set({ searchResults: results }),

        setIsSearching: (isSearching) => set({ isSearching }),

        addToCart: (item) => set((state) => {
          const existingItem = state.cart.find(cartItem => cartItem.id === item.id)
          
          if (existingItem) {
            const updatedCart = state.cart.map(cartItem =>
              cartItem.id === item.id
                ? { ...cartItem, quantity: cartItem.quantity + 1 }
                : cartItem
            )
            return { 
              cart: updatedCart,
              cartTotal: updatedCart.reduce((total, item) => total + (item.cost * item.quantity), 0)
            }
          } else {
            const newCart = [...state.cart, { ...item, quantity: 1, addedAt: new Date() }]
            return { 
              cart: newCart,
              cartTotal: newCart.reduce((total, item) => total + (item.cost * item.quantity), 0)
            }
          }
        }),

        removeFromCart: (itemId) => set((state) => {
          const updatedCart = state.cart.filter(item => item.id !== itemId)
          return { 
            cart: updatedCart,
            cartTotal: updatedCart.reduce((total, item) => total + (item.cost * item.quantity), 0)
          }
        }),

        clearCart: () => set({ cart: [], cartTotal: 0 }),

        setViewMode: (mode) => set({ viewMode: mode }),

        toggleMediaSelection: (item) => set((state) => {
          const isSelected = state.selectedMedia.some(selected => selected.id === item.id)
          if (isSelected) {
            return {
              selectedMedia: state.selectedMedia.filter(selected => selected.id !== item.id)
            }
          } else {
            return {
              selectedMedia: [...state.selectedMedia, item]
            }
          }
        }),

        setSidebarOpen: (open) => set({ sidebarOpen: open }),

        updateCartItemQuantity: (itemId, quantity) => set((state) => {
          if (quantity <= 0) {
            return {
              cart: state.cart.filter(item => item.id !== itemId),
              cartTotal: state.cart
                .filter(item => item.id !== itemId)
                .reduce((total, item) => total + (item.cost * item.quantity), 0)
            }
          }

          const updatedCart = state.cart.map(item =>
            item.id === itemId ? { ...item, quantity } : item
          )
          return { 
            cart: updatedCart,
            cartTotal: updatedCart.reduce((total, item) => total + (item.cost * item.quantity), 0)
          }
        }),

        addNotification: (n) => set((state) => ({
          notifications: [
            { id: n.id || crypto.randomUUID(), title: n.title, body: n.body, href: n.href, cta: n.cta, createdAt: Date.now() },
            ...state.notifications
          ].slice(0, 50)
        })),
        clearNotifications: () => set({ notifications: [] })
      }),
      {
        name: 'stockmedia-store',
        partialize: (state) => ({
          user: state.user,
          isAuthenticated: state.isAuthenticated,
          cart: state.cart,
          cartTotal: state.cartTotal,
          viewMode: state.viewMode,
          searchFilters: state.searchFilters,
          notifications: state.notifications
        })
      }
    ),
    {
      name: 'stockmedia-store'
    }
  )
)

// Selectors for better performance
export const useUser = () => useAppStore(state => state.user)
export const useIsAuthenticated = () => useAppStore(state => state.isAuthenticated)
export const useSearchQuery = () => useAppStore(state => state.searchQuery)
export const useSearchFilters = () => useAppStore(state => state.searchFilters)
export const useSearchResults = () => useAppStore(state => state.searchResults)
export const useIsSearching = () => useAppStore(state => state.isSearching)
export const useCart = () => useAppStore(state => state.cart)
export const useCartTotal = () => useAppStore(state => state.cartTotal)
export const useViewMode = () => useAppStore(state => state.viewMode)
export const useSelectedMedia = () => useAppStore(state => state.selectedMedia)
export const useSidebarOpen = () => useAppStore(state => state.sidebarOpen)
