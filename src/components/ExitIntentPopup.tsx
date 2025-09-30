'use client'

import { useState, useEffect } from 'react'
import { Typography, Button } from '@/components/ui'
import { X, Gift, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useRouter } from 'next/navigation'

export function ExitIntentPopup() {
  const [isVisible, setIsVisible] = useState(false)
  const [hasShown, setHasShown] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if popup was already shown in this session
    const shown = sessionStorage.getItem('exit-intent-shown')
    if (shown) {
      setHasShown(true)
      return
    }

    // Check if user dismissed it permanently
    const dismissed = localStorage.getItem('exit-intent-dismissed')
    if (dismissed) {
      setHasShown(true)
      return
    }

    let exitIntentTriggered = false

    const handleMouseLeave = (e: MouseEvent) => {
      // Only trigger when mouse leaves from the top of the page
      if (e.clientY <= 0 && !exitIntentTriggered && !hasShown) {
        exitIntentTriggered = true
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('exit-intent-shown', 'true')
      }
    }

    // Mobile: trigger on scroll to top after scrolling down
    let lastScrollY = window.scrollY
    const handleScroll = () => {
      const currentScrollY = window.scrollY
      
      // User scrolled down at least 500px, then back to near top
      if (lastScrollY > 500 && currentScrollY < 100 && !exitIntentTriggered && !hasShown) {
        exitIntentTriggered = true
        setIsVisible(true)
        setHasShown(true)
        sessionStorage.setItem('exit-intent-shown', 'true')
      }
      
      lastScrollY = currentScrollY
    }

    // Delay before activating to avoid false positives
    const timer = setTimeout(() => {
      document.addEventListener('mouseleave', handleMouseLeave)
      window.addEventListener('scroll', handleScroll)
    }, 5000) // Wait 5 seconds before activating

    return () => {
      clearTimeout(timer)
      document.removeEventListener('mouseleave', handleMouseLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [hasShown])

  const handleClose = () => {
    setIsVisible(false)
  }

  const handleDismiss = () => {
    setIsVisible(false)
    localStorage.setItem('exit-intent-dismissed', 'true')
  }

  const handleCTA = () => {
    setIsVisible(false)
    router.push('/register?utm_source=exit-intent&utm_medium=popup')
  }

  if (!isVisible) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] animate-in fade-in duration-200"
        onClick={handleClose}
      />

      {/* Popup */}
      <div className="fixed inset-0 z-[101] flex items-center justify-center p-4 pointer-events-none">
        <div
          className={cn(
            "relative bg-[hsl(var(--card))] rounded-2xl shadow-2xl max-w-md w-full p-8 pointer-events-auto",
            "animate-in zoom-in-95 duration-200"
          )}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={handleClose}
            className="absolute top-4 right-4 text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))] transition-colors"
            aria-label="Close popup"
          >
            <X className="h-6 w-6" />
          </button>

          {/* Icon */}
          <div className="flex justify-center mb-6">
            <div className="bg-gradient-to-r from-orange-500 to-orange-600 rounded-full p-4">
              <Gift className="h-12 w-12 text-white" />
            </div>
          </div>

          {/* Content */}
          <div className="text-center mb-6">
            <Typography variant="h2" className="text-2xl font-bold mb-3">
              Wait! Don't Miss Out 🎁
            </Typography>
            <Typography variant="body" className="text-[hsl(var(--muted-foreground))]">
              Start your free account now and get instant access to:
            </Typography>
          </div>

          {/* Benefits */}
          <ul className="space-y-3 mb-6">
            {[
              '50 free points to get started',
              'Access to 25+ premium stock sites',
              'No credit card required',
              'Smart point rollover system',
            ].map((benefit, index) => (
              <li key={index} className="flex items-start gap-3">
                <div className="flex-shrink-0 w-6 h-6 bg-green-500/10 rounded-full flex items-center justify-center mt-0.5">
                  <svg className="w-4 h-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <Typography variant="body" className="text-[hsl(var(--foreground))]">
                  {benefit}
                </Typography>
              </li>
            ))}
          </ul>

          {/* CTA Buttons */}
          <div className="space-y-3">
            <Button
              onClick={handleCTA}
              className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 h-12 text-base font-semibold"
            >
              Claim Your Free Points
              <ArrowRight className="h-5 w-5 ml-2" />
            </Button>
            <Button
              variant="ghost"
              onClick={handleDismiss}
              className="w-full text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
            >
              No thanks, I'll pay full price
            </Button>
          </div>

          {/* Footer */}
          <Typography variant="body-sm" className="text-center text-[hsl(var(--muted-foreground))] mt-4">
            Join 10,000+ creators using Stock Media SaaS
          </Typography>
        </div>
      </div>
    </>
  )
}
