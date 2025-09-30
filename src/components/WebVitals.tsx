'use client'

import { useEffect } from 'react'
import { useReportWebVitals } from 'next/web-vitals'

export function WebVitals() {
  useReportWebVitals((metric) => {
    // Log to console in development
    if (process.env.NODE_ENV === 'development') {
      console.log('Web Vital:', metric)
    }

    // Send to analytics in production
    if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
      // Send to Vercel Analytics (automatically handled by Vercel)
      // Or send to your custom analytics
      const body = JSON.stringify({
        name: metric.name,
        value: metric.value,
        rating: metric.rating,
        delta: metric.delta,
        id: metric.id,
        navigationType: metric.navigationType,
      })

      // Example: Send to custom analytics endpoint
      if (navigator.sendBeacon) {
        navigator.sendBeacon('/api/analytics/vitals', body)
      } else {
        fetch('/api/analytics/vitals', {
          body,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          keepalive: true,
        }).catch(console.error)
      }
    }
  })

  // Performance Observer for additional metrics
  useEffect(() => {
    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      return
    }

    try {
      // Observe Largest Contentful Paint
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1]
        
        if (process.env.NODE_ENV === 'development') {
          console.log('LCP Element:', lastEntry)
        }
      })

      lcpObserver.observe({ type: 'largest-contentful-paint', buffered: true })

      // Observe Layout Shifts
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries()
        if (process.env.NODE_ENV === 'development') {
          console.log('Layout Shifts:', entries.length)
        }
      })

      clsObserver.observe({ type: 'layout-shift', buffered: true })

      return () => {
        lcpObserver.disconnect()
        clsObserver.disconnect()
      }
    } catch (error) {
      console.error('Performance Observer error:', error)
    }
  }, [])

  return null
}
