'use client'

import React, { createContext, useContext, useState, useCallback } from 'react'
import { MediaItem } from '@/components/search/MediaCard'

interface PurchaseContextType {
  selectedMedia: MediaItem | null
  isModalOpen: boolean
  userPoints: number
  selectMedia: (media: MediaItem) => void
  closeModal: () => void
  updateUserPoints: (points: number) => void
  confirmPurchase: (media: MediaItem) => Promise<void>
}

const PurchaseContext = createContext<PurchaseContextType | undefined>(undefined)

interface PurchaseProviderProps {
  children: React.ReactNode
  initialPoints?: number
}

export const PurchaseProvider: React.FC<PurchaseProviderProps> = ({
  children,
  initialPoints = 0
}) => {
  const [selectedMedia, setSelectedMedia] = useState<MediaItem | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [userPoints, setUserPoints] = useState(initialPoints)

  const selectMedia = useCallback((media: MediaItem) => {
    setSelectedMedia(media)
    setIsModalOpen(true)
  }, [])

  const closeModal = useCallback(() => {
    setIsModalOpen(false)
    setSelectedMedia(null)
  }, [])

  const updateUserPoints = useCallback((points: number) => {
    setUserPoints(points)
  }, [])

  const confirmPurchase = useCallback(async (media: MediaItem) => {
    try {
      // Call the purchase API
      const response = await fetch('/api/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          mediaId: media.id,
          mediaType: media.type,
          points: media.points,
          price: media.price
        })
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.message || 'Purchase failed')
      }

      const result = await response.json()
      
      // Update user points
      setUserPoints(prev => prev - media.points)
      
      // Close modal
      closeModal()
      
      // Show success message (you can implement a toast notification here)
      console.log('Purchase successful:', result)
      
      return result
    } catch (error) {
      console.error('Purchase error:', error)
      throw error
    }
  }, [closeModal])

  const value: PurchaseContextType = {
    selectedMedia,
    isModalOpen,
    userPoints,
    selectMedia,
    closeModal,
    updateUserPoints,
    confirmPurchase
  }

  return (
    <PurchaseContext.Provider value={value}>
      {children}
    </PurchaseContext.Provider>
  )
}

export const usePurchase = () => {
  const context = useContext(PurchaseContext)
  if (context === undefined) {
    throw new Error('usePurchase must be used within a PurchaseProvider')
  }
  return context
}
