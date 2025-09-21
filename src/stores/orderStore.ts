import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'

export interface ParsedUrl {
  source: string
  id: string
  url: string
}

export interface StockSite {
  id: string
  name: string
  displayName: string
  cost: number
  isActive: boolean
}

export interface StockInfo {
  id: string
  title: string
  description: string
  thumbnailUrl: string
  previewUrl: string
  type: string
  category: string
  license: string
  price: number
  points: number
  size: string
  dimensions: { width: number; height: number }
  author: {
    id: string
    name: string
    avatar?: string
  }
  tags: string[]
  createdAt: string
  rating: number
  downloadCount: number
  isAvailable: boolean
  downloadUrl: string
}

export interface PreOrderItem {
  url: string
  parsedData: ParsedUrl | null
  stockSite: StockSite | null
  stockInfo: StockInfo | null
  success: boolean
  error?: string
}

export interface ConfirmedOrder {
  id: string
  url: string
  source: string
  assetId: string
  title: string
  price: number
  points: number
  type: string
  thumbnailUrl: string
  status: 'PENDING' | 'PROCESSING' | 'READY' | 'COMPLETED' | 'FAILED'
  downloadUrl?: string
  error?: string
  estimatedTime?: string
  createdAt: string
  updatedAt?: string
  isProcessing?: boolean
  canDownload?: boolean
}

interface OrderState {
  // Step management
  step: 'input' | 'confirmation' | 'progress'
  
  // URLs and parsing state
  urls: string
  isLoading: boolean
  preOrderItems: PreOrderItem[]
  
  // Confirmation state
  isConfirming: boolean
  confirmedOrders: ConfirmedOrder[]
  
  // Progress tracking
  isTrackingProgress: boolean
  orderStatuses: Record<string, string>
  
  // User balance
  userPoints: number
  
  // Error handling
  error: string | null
  
  // Actions
  setStep: (step: 'input' | 'confirmation' | 'progress') => void
  setUrls: (urls: string) => void
  setLoading: (loading: boolean) => void
  setPreOrderItems: (items: PreOrderItem[]) => void
  addPreOrderItem: (item: PreOrderItem) => void
  removePreOrderItem: (index: number) => void
  
  setConfirming: (confirming: boolean) => void
  setConfirmedOrders: (orders: ConfirmedOrder[]) => void
  addConfirmedOrder: (order: ConfirmedOrder) => void
  updateOrderStatus: (orderId: string, status: string, downloadUrl?: string, error?: string) => void
  updateOrderProgress: (orderId: string, orderData: Partial<ConfirmedOrder>) => void
  
  setUserPoints: (points: number) => void
  setTrackingProgress: (tracking: boolean) => void
  setOrderStatuses: (statuses: Record<string, string>) => void
  setError: (error: string | null) => void
  
  // Complex actions
  parseUrls: () => Promise<{ successCount: number; errorCount: number }>
  confirmOrder: () => Promise<ConfirmedOrder[]>
  clearOrder: () => void
  startProgressTracking: () => void
  stopProgressTracking: () => void
  pollOrderStatus: (orderId: string) => Promise<void>
  pollAllOrders: () => Promise<void>
  
  // Computed values
  getTotalPoints: () => number
  getSuccessfulItems: () => PreOrderItem[]
  getFailedItems: () => PreOrderItem[]
  canPlaceOrder: () => boolean
  getPendingOrders: () => ConfirmedOrder[]
  getCompletedOrders: () => ConfirmedOrder[]
  getFailedOrders: () => ConfirmedOrder[]
}

export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        step: 'input',
        urls: '',
        isLoading: false,
        preOrderItems: [],
        isConfirming: false,
        confirmedOrders: [],
        isTrackingProgress: false,
        orderStatuses: {},
        userPoints: 0,
        error: null,

        // Basic setters
        setStep: (step) => set({ step }),
        setUrls: (urls) => set({ urls }),
        setLoading: (loading) => set({ isLoading: loading }),
        setPreOrderItems: (items) => set({ preOrderItems: items }),
        setConfirming: (confirming) => set({ isConfirming: confirming }),
        setConfirmedOrders: (orders) => set({ confirmedOrders: orders }),
        setUserPoints: (points) => set({ userPoints: points }),
        setTrackingProgress: (tracking) => set({ isTrackingProgress: tracking }),
        setOrderStatuses: (statuses) => set({ orderStatuses: statuses }),
        setError: (error) => set({ error }),

        // Item management
        addPreOrderItem: (item) => set((state) => ({
          preOrderItems: [...state.preOrderItems, item]
        })),
        removePreOrderItem: (index) => set((state) => ({
          preOrderItems: state.preOrderItems.filter((_, i) => i !== index)
        })),
        addConfirmedOrder: (order) => set((state) => ({
          confirmedOrders: [...state.confirmedOrders, order]
        })),

        updateOrderStatus: (orderId, status, downloadUrl, error) => set((state) => ({
          confirmedOrders: state.confirmedOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  status: status as any, 
                  downloadUrl: downloadUrl || order.downloadUrl,
                  error: error || order.error,
                  updatedAt: new Date().toISOString()
                }
              : order
          ),
          orderStatuses: {
            ...state.orderStatuses,
            [orderId]: status
          }
        })),

        updateOrderProgress: (orderId, orderData) => set((state) => ({
          confirmedOrders: state.confirmedOrders.map(order => 
            order.id === orderId 
              ? { 
                  ...order, 
                  ...orderData,
                  updatedAt: new Date().toISOString()
                }
              : order
          )
        })),

        // Complex actions
        parseUrls: async () => {
          const state = get()
          const { urls } = state

          if (!urls.trim()) {
            throw new Error('Please enter at least one URL')
          }

          set({ isLoading: true, preOrderItems: [], error: null })

          try {
            // Split URLs by line and filter out empty lines
            const urlList = urls
              .split('\n')
              .map(url => url.trim())
              .filter(url => url.length > 0)

            if (urlList.length === 0) {
              throw new Error('Please enter valid URLs')
            }

            // Process each URL
            const promises = urlList.map(async (url) => {
              try {
                const response = await fetch('/api/stock-info', {
                  method: 'POST',
                  headers: {
                    'Content-Type': 'application/json',
                  },
                  body: JSON.stringify({ url }),
                })

                const data = await response.json()
                
                return {
                  url,
                  parsedData: data.success ? data.parsedData : null,
                  stockSite: data.success ? data.stockSite : null,
                  stockInfo: data.success ? data.stockInfo : null,
                  success: data.success,
                  error: data.success ? null : data.message
                } as PreOrderItem
              } catch (error) {
                return {
                  url,
                  parsedData: null,
                  stockSite: null,
                  stockInfo: null,
                  success: false,
                  error: 'Failed to fetch information'
                } as PreOrderItem
              }
            })

            const results = await Promise.all(promises)
            set({ preOrderItems: results, isLoading: false })

            // Move to confirmation step if we have successful items
            const successCount = results.filter(r => r.success).length
            if (successCount > 0) {
              set({ step: 'confirmation' })
            }

            // Return summary for toast notifications
            const errorCount = results.length - successCount
            return { successCount, errorCount }

          } catch (error) {
            set({ isLoading: false, error: error instanceof Error ? error.message : 'Unknown error' })
            throw error
          }
        },

        confirmOrder: async () => {
          const state = get()
          const { preOrderItems, userPoints } = state

          if (preOrderItems.length === 0) {
            throw new Error('No items to order')
          }

          const successfulItems = get().getSuccessfulItems()
          if (successfulItems.length === 0) {
            throw new Error('No valid items to order')
          }

          const totalPoints = get().getTotalPoints()
          if (userPoints < totalPoints) {
            throw new Error(`Insufficient points. You need ${totalPoints.toLocaleString()} points but only have ${userPoints.toLocaleString()}`)
          }

          set({ isConfirming: true, error: null })

          try {
            // Create orders for each successful item
            const orderPromises = successfulItems.map(async (item) => {
              const response = await fetch('/api/place-order', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                  url: item.url,
                  source: item.parsedData?.source,
                  assetId: item.parsedData?.id,
                  title: item.stockInfo?.title,
                  price: item.stockInfo?.price,
                  points: item.stockInfo?.points,
                  type: item.stockInfo?.type,
                  thumbnailUrl: item.stockInfo?.thumbnailUrl,
                }),
              })

              const data = await response.json()

              if (!data.success) {
                throw new Error(data.message || 'Failed to place order')
              }

              return {
                id: data.order?.id || `temp-${Date.now()}`,
                url: item.url,
                source: item.parsedData?.source || 'unknown',
                assetId: item.parsedData?.id || 'unknown',
                title: item.stockInfo?.title || 'Unknown Title',
                price: item.stockInfo?.price || 0,
                points: item.stockInfo?.points || 0,
                type: item.stockInfo?.type || 'unknown',
                thumbnailUrl: item.stockInfo?.thumbnailUrl || '',
                status: data.order?.status || 'PENDING',
                downloadUrl: data.order?.downloadUrl,
                createdAt: new Date().toISOString()
              } as ConfirmedOrder
            })

            const confirmedOrders = await Promise.all(orderPromises)
            
            set({ 
              confirmedOrders,
              isConfirming: false,
              userPoints: userPoints - totalPoints, // Deduct points
              step: 'progress' // Move to progress step
            })

            return confirmedOrders

          } catch (error) {
            set({ isConfirming: false, error: error instanceof Error ? error.message : 'Unknown error' })
            throw error
          }
        },

        clearOrder: () => set({
          step: 'input',
          urls: '',
          preOrderItems: [],
          confirmedOrders: [],
          isLoading: false,
          isConfirming: false,
          isTrackingProgress: false,
          orderStatuses: {},
          error: null
        }),

        startProgressTracking: () => {
          const state = get()
          const pendingOrders = state.confirmedOrders.filter(order => 
            order.status === 'PENDING' || order.status === 'PROCESSING'
          )
          
          if (pendingOrders.length > 0) {
            set({ isTrackingProgress: true })
          }
        },

        stopProgressTracking: () => set({ isTrackingProgress: false }),

        pollOrderStatus: async (orderId: string) => {
          try {
            const response = await fetch(`/api/orders/${orderId}/status`)
            const data = await response.json()
            
            if (data.success && data.order) {
              const { status, downloadUrl, error } = data.order
              
              // Update the order in confirmedOrders
              set((state) => ({
                confirmedOrders: state.confirmedOrders.map(order => 
                  order.id === orderId 
                    ? { 
                        ...order, 
                        status: status as any, 
                        downloadUrl: downloadUrl || order.downloadUrl,
                        error: error || order.error,
                        updatedAt: new Date().toISOString()
                      }
                    : order
                ),
                orderStatuses: {
                  ...state.orderStatuses,
                  [orderId]: status
                }
              }))
            }
          } catch (error) {
            console.error(`Failed to poll order ${orderId}:`, error)
          }
        },

        pollAllOrders: async () => {
          const state = get()
          const pendingOrders = state.confirmedOrders.filter(order => 
            order.status === 'PENDING' || order.status === 'PROCESSING'
          )
          
          if (pendingOrders.length === 0) {
            set({ isTrackingProgress: false })
            return
          }

          // Poll each pending order
          const promises = pendingOrders.map(order => get().pollOrderStatus(order.id))
          await Promise.all(promises)
          
          // Check if any orders are still pending after polling
          const stillPending = get().confirmedOrders.filter(order => 
            order.status === 'PENDING' || order.status === 'PROCESSING'
          )
          
          if (stillPending.length === 0) {
            set({ isTrackingProgress: false })
          }
        },

        // Computed values
        getTotalPoints: () => {
          const state = get()
          return state.preOrderItems
            .filter(item => item.success && item.stockInfo)
            .reduce((total, item) => total + (item.stockInfo?.points || 0), 0)
        },

        getSuccessfulItems: () => {
          const state = get()
          return state.preOrderItems.filter(item => item.success)
        },

        getFailedItems: () => {
          const state = get()
          return state.preOrderItems.filter(item => !item.success)
        },

        canPlaceOrder: () => {
          const state = get()
          const successfulItems = state.getSuccessfulItems()
          const totalPoints = state.getTotalPoints()
          
          return successfulItems.length > 0 && state.userPoints >= totalPoints
        },

        getPendingOrders: () => {
          const state = get()
          return state.confirmedOrders.filter(order => 
            order.status === 'PENDING' || order.status === 'PROCESSING'
          )
        },

        getCompletedOrders: () => {
          const state = get()
          return state.confirmedOrders.filter(order => 
            order.status === 'READY' || order.status === 'COMPLETED'
          )
        },

        getFailedOrders: () => {
          const state = get()
          return state.confirmedOrders.filter(order => order.status === 'FAILED')
        }
      }),
      {
        name: 'order-store',
        partialize: (state) => ({
          userPoints: state.userPoints,
          // Don't persist temporary data like URLs, preOrderItems, etc.
        })
      }
    ),
    {
      name: 'order-store'
    }
  )
)