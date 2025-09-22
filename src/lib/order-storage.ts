'use client'

import { OrderItemData } from '@/components/dashboard/UnifiedOrderItem'

const STORAGE_KEY = 'stock-media-draft-order'

export interface DraftOrder {
  urls: string
  items: OrderItemData[]
  timestamp: number
}

export const saveDraftOrder = (urls: string, items: OrderItemData[]) => {
  try {
    const draftOrder: DraftOrder = {
      urls,
      items,
      timestamp: Date.now()
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftOrder))
  } catch (error) {
    console.error('Failed to save draft order:', error)
  }
}

export const loadDraftOrder = (): DraftOrder | null => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const draftOrder = JSON.parse(stored) as DraftOrder
    
    // Check if draft is less than 24 hours old
    const isRecent = Date.now() - draftOrder.timestamp < 24 * 60 * 60 * 1000
    if (!isRecent) {
      clearDraftOrder()
      return null
    }
    
    return draftOrder
  } catch (error) {
    console.error('Failed to load draft order:', error)
    return null
  }
}

export const clearDraftOrder = () => {
  try {
    localStorage.removeItem(STORAGE_KEY)
  } catch (error) {
    console.error('Failed to clear draft order:', error)
  }
}

export const hasDraftOrder = (): boolean => {
  return loadDraftOrder() !== null
}
