// src/hooks/useServiceWorker.ts

import { useEffect, useState } from 'react'

export function useServiceWorker() {
  const [isSupported, setIsSupported] = useState(false)
  const [isRegistered, setIsRegistered] = useState(false)
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      setIsSupported(true)
      
      // Register service worker
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          console.log('Service Worker registered successfully:', reg)
          setRegistration(reg)
          setIsRegistered(true)
        })
        .catch((error) => {
          console.error('Service Worker registration failed:', error)
          setIsRegistered(false)
        })
    } else {
      console.warn('Service Worker not supported in this browser')
      setIsSupported(false)
    }
  }, [])

  return {
    isSupported,
    isRegistered,
    registration
  }
}
