'use client'

import { useState, useEffect } from 'react'
import { Typography } from '@/components/ui'
import { User, Download, MapPin, X } from 'lucide-react'
import { cn } from '@/lib/utils'

// Sample activities - in production, fetch from API
const activities = [
  { type: 'signup', name: 'Sarah from New York', action: 'just signed up', icon: User },
  { type: 'download', name: 'Michael from London', action: 'downloaded 5 assets', icon: Download },
  { type: 'signup', name: 'Emma from Tokyo', action: 'started free trial', icon: User },
  { type: 'download', name: 'David from Sydney', action: 'downloaded 10 assets', icon: Download },
  { type: 'signup', name: 'Lisa from Paris', action: 'joined the platform', icon: User },
  { type: 'download', name: 'James from Toronto', action: 'downloaded premium content', icon: Download },
]

export function SocialProofTicker() {
  const [currentActivity, setCurrentActivity] = useState(0)
  const [isVisible, setIsVisible] = useState(false)
  const [hasInteracted, setHasInteracted] = useState(false)

  useEffect(() => {
    // Check if user has dismissed
    const dismissed = localStorage.getItem('social-proof-dismissed')
    if (dismissed) return

    // Show first notification after 3 seconds
    const initialDelay = setTimeout(() => {
      setIsVisible(true)
    }, 3000)

    return () => clearTimeout(initialDelay)
  }, [])

  useEffect(() => {
    if (!isVisible || hasInteracted) return

    // Cycle through activities every 8 seconds
    const interval = setInterval(() => {
      setIsVisible(false)
      
      setTimeout(() => {
        setCurrentActivity((prev) => (prev + 1) % activities.length)
        setIsVisible(true)
      }, 500) // Brief pause between notifications
    }, 8000)

    return () => clearInterval(interval)
  }, [isVisible, hasInteracted])

  const handleClose = () => {
    setIsVisible(false)
    setHasInteracted(true)
    localStorage.setItem('social-proof-dismissed', 'true')
  }

  if (!isVisible) return null

  const activity = activities[currentActivity]
  const Icon = activity.icon

  return (
    <div
      className={cn(
        "fixed bottom-6 left-6 z-40 max-w-sm",
        "animate-in slide-in-from-bottom-5 duration-500"
      )}
    >
      <div className="bg-white dark:bg-gray-900 rounded-lg shadow-2xl border border-gray-200 dark:border-gray-800 p-4 pr-10 relative">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
          aria-label="Close notification"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-3">
          {/* Icon */}
          <div className={cn(
            "flex-shrink-0 rounded-full p-2",
            activity.type === 'signup' 
              ? "bg-green-100 dark:bg-green-900/30" 
              : "bg-blue-100 dark:bg-blue-900/30"
          )}>
            <Icon className={cn(
              "h-5 w-5",
              activity.type === 'signup' ? "text-green-600 dark:text-green-400" : "text-blue-600 dark:text-blue-400"
            )} />
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <Typography variant="body" className="font-semibold text-sm">
                {activity.name}
              </Typography>
              <MapPin className="h-3 w-3 text-gray-400" />
            </div>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))]">
              {activity.action}
            </Typography>
            <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] text-xs mt-1">
              Just now
            </Typography>
          </div>
        </div>

        {/* Pulse Animation */}
        <div className="absolute -top-1 -left-1 h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-orange-500"></span>
        </div>
      </div>
    </div>
  )
}
