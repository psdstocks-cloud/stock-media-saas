/**
 * Performance utilities for optimizing app performance
 */

/**
 * Lazy load component with loading fallback
 */
export function lazyLoadComponent<T extends React.ComponentType<any>>(
  importFunc: () => Promise<{ default: T }>,
  fallback?: React.ReactNode
) {
  const LazyComponent = React.lazy(importFunc)
  
  return (props: React.ComponentProps<T>) => (
    <React.Suspense fallback={fallback || <div>Loading...</div>}>
      <LazyComponent {...props} />
    </React.Suspense>
  )
}

import React from 'react'

/**
 * Debounce function for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      timeout = null
      func(...args)
    }

    if (timeout) {
      clearTimeout(timeout)
    }
    timeout = setTimeout(later, wait)
  }
}

/**
 * Throttle function for performance optimization
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false

  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

/**
 * Measure performance of a function
 */
export async function measurePerformance<T>(
  name: string,
  fn: () => Promise<T> | T
): Promise<T> {
  const start = performance.now()
  const result = await fn()
  const end = performance.now()
  const duration = end - start

  if (process.env.NODE_ENV === 'development') {
    console.log(`⚡ ${name} took ${duration.toFixed(2)}ms`)
  }

  // Send to analytics in production
  if (typeof window !== 'undefined' && process.env.NODE_ENV === 'production') {
    try {
      navigator.sendBeacon(
        '/api/analytics/performance',
        JSON.stringify({ name, duration })
      )
    } catch (error) {
      // Silently fail
    }
  }

  return result
}

/**
 * Prefetch a route for faster navigation
 */
export function prefetchRoute(router: any, path: string) {
  if (typeof window !== 'undefined' && 'requestIdleCallback' in window) {
    requestIdleCallback(() => {
      router.prefetch(path)
    })
  } else {
    // Fallback for browsers without requestIdleCallback
    setTimeout(() => {
      router.prefetch(path)
    }, 100)
  }
}

/**
 * Intersection Observer hook for lazy loading
 */
export function useIntersectionObserver(
  ref: React.RefObject<Element>,
  options: IntersectionObserverInit = {}
): boolean {
  const [isIntersecting, setIsIntersecting] = React.useState(false)

  React.useEffect(() => {
    if (!ref.current) return

    const observer = new IntersectionObserver(([entry]) => {
      setIsIntersecting(entry.isIntersecting)
    }, options)

    observer.observe(ref.current)

    return () => {
      observer.disconnect()
    }
  }, [ref, options])

  return isIntersecting
}

/**
 * Load script dynamically
 */
export function loadScript(src: string, async: boolean = true): Promise<void> {
  return new Promise((resolve, reject) => {
    const script = document.createElement('script')
    script.src = src
    script.async = async
    script.onload = () => resolve()
    script.onerror = () => reject(new Error(`Failed to load script: ${src}`))
    document.head.appendChild(script)
  })
}

/**
 * Preload image
 */
export function preloadImage(src: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve()
    img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
    img.src = src
  })
}

/**
 * Get current Web Vitals
 */
export function getWebVitals(): Promise<{
  lcp: number | null
  fid: number | null
  cls: number | null
  fcp: number | null
  ttfb: number | null
}> {
  return new Promise((resolve) => {
    const vitals = {
      lcp: null as number | null,
      fid: null as number | null,
      cls: null as number | null,
      fcp: null as number | null,
      ttfb: null as number | null,
    }

    if (typeof window === 'undefined' || !('PerformanceObserver' in window)) {
      resolve(vitals)
      return
    }

    try {
      // LCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const lastEntry = entries[entries.length - 1] as any
        vitals.lcp = lastEntry.renderTime || lastEntry.loadTime
      }).observe({ type: 'largest-contentful-paint', buffered: true })

      // FID
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0] as any
        vitals.fid = firstEntry.processingStart - firstEntry.startTime
      }).observe({ type: 'first-input', buffered: true })

      // CLS
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries() as any[]) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            vitals.cls = clsValue
          }
        }
      }).observe({ type: 'layout-shift', buffered: true })

      // FCP
      new PerformanceObserver((list) => {
        const entries = list.getEntries()
        const firstEntry = entries[0] as any
        vitals.fcp = firstEntry.startTime
      }).observe({ type: 'paint', buffered: true })

      // TTFB
      const navigationTiming = performance.getEntriesByType(
        'navigation'
      )[0] as PerformanceNavigationTiming
      if (navigationTiming) {
        vitals.ttfb = navigationTiming.responseStart - navigationTiming.requestStart
      }

      setTimeout(() => resolve(vitals), 3000)
    } catch (error) {
      resolve(vitals)
    }
  })
}
