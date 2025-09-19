import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { MediaItem } from '@/components/search/MediaCard'

interface OrderState {
  // Modal state
  isConfirmationModalOpen: boolean
  selectedItemForPurchase: MediaItem | null
  
  // User points
  userPoints: number
  
  // Loading states
  isProcessingPurchase: boolean
  
  // Actions
  openConfirmationModal: (item: MediaItem) => void
  closeConfirmationModal: () => void
  setUserPoints: (points: number) => void
  setProcessingPurchase: (isProcessing: boolean) => void
  
  // Purchase actions
  confirmPurchase: (item: MediaItem) => Promise<void>
}

export const useOrderStore = create<OrderState>()(
  devtools(
    persist(
      (set, get) => ({
        // Initial state
        isConfirmationModalOpen: false,
        selectedItemForPurchase: null,
        userPoints: 500, // Default points for demo
        isProcessingPurchase: false,

        // Actions
        openConfirmationModal: (item: MediaItem) => {
          set({
            isConfirmationModalOpen: true,
            selectedItemForPurchase: item
          })
        },

        closeConfirmationModal: () => {
          set({
            isConfirmationModalOpen: false,
            selectedItemForPurchase: null,
            isProcessingPurchase: false
          })
        },

        setUserPoints: (points: number) => {
          set({ userPoints: points })
        },

        setProcessingPurchase: (isProcessing: boolean) => {
          set({ isProcessingPurchase: isProcessing })
        },

        // Purchase confirmation
        confirmPurchase: async (item: MediaItem) => {
          const { userPoints, setProcessingPurchase, closeConfirmationModal, setUserPoints } = get()
          
          // Check if user has enough points
          if (userPoints < item.points) {
            throw new Error(`Insufficient points. You need ${item.points - userPoints} more points.`)
          }

          setProcessingPurchase(true)

          try {
            // Call the purchase API
            const response = await fetch('/api/purchase', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                mediaId: item.id,
                mediaType: item.type,
                points: item.points,
                price: item.price
              })
            })

            if (!response.ok) {
              const errorData = await response.json()
              throw new Error(errorData.message || 'Purchase failed')
            }

            const result = await response.json()
            
            // Update user points
            setUserPoints(result.data.remainingPoints)
            
            // Close modal
            closeConfirmationModal()
            
            // Show success message (you can implement a toast notification here)
            console.log('Purchase successful:', result)
            
            return result
          } catch (error) {
            console.error('Purchase error:', error)
            throw error
          } finally {
            setProcessingPurchase(false)
          }
        }
      }),
      {
        name: 'order-store',
        // Only persist the user points, not the modal state
        partialize: (state) => ({
          userPoints: state.userPoints
        })
      }
    ),
    {
      name: 'order-store'
    }
  )
)

// Selectors for better performance
export const useOrderModal = () => useOrderStore((state) => ({
  isConfirmationModalOpen: state.isConfirmationModalOpen,
  selectedItemForPurchase: state.selectedItemForPurchase,
  openConfirmationModal: state.openConfirmationModal,
  closeConfirmationModal: state.closeConfirmationModal
}))

export const useUserPoints = () => useOrderStore((state) => ({
  userPoints: state.userPoints,
  setUserPoints: state.setUserPoints
}))

export const usePurchaseActions = () => useOrderStore((state) => ({
  confirmPurchase: state.confirmPurchase,
  isProcessingPurchase: state.isProcessingPurchase
}))
