'use client'

import { useEffect } from 'react'

// Tawk.to Chat Widget Component
// Get your property ID from https://dashboard.tawk.to/#/admin

export function ChatWidget() {
  useEffect(() => {
    // Get Tawk.to Property ID from environment
    const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || ''
    
    // Only load if property ID is configured
    if (!TAWK_PROPERTY_ID || TAWK_PROPERTY_ID === 'your-tawk-property-id-here/default') {
      console.log('💬 Tawk.to: Property ID not configured. Please:')
      console.log('1. Sign up at https://tawk.to (FREE)')
      console.log('2. Get your Property ID from dashboard')
      console.log('3. Add NEXT_PUBLIC_TAWK_PROPERTY_ID to .env.local and Vercel')
      console.log('4. Format: xxxxxxxxxxxxxxxxxxxxxxxx/default')
      return
    }

    // Check if Tawk is already loaded
    if ((window as any).Tawk_API) {
      return
    }

    // Load Tawk.to script
    const script = document.createElement('script')
    script.async = true
    script.src = `https://embed.tawk.to/${TAWK_PROPERTY_ID}`
    script.charset = 'UTF-8'
    script.setAttribute('crossorigin', '*')
    
    script.onload = () => {
      console.log('💬 Tawk.to chat widget loaded')
      
      // Optional: Customize Tawk.to
      if ((window as any).Tawk_API) {
        // Hide widget on specific pages
        const hideChatPages = ['/admin', '/login', '/register']
        if (hideChatPages.some(page => window.location.pathname.startsWith(page))) {
          (window as any).Tawk_API.hideWidget()
        }

        // Set visitor info if user is logged in
        // You can customize this based on your auth system
        (window as any).Tawk_API.onLoad = function() {
          // Example: Set visitor name and email
          // const user = getUserFromSession()
          // if (user) {
          //   (window as any).Tawk_API.setAttributes({
          //     name: user.name,
          //     email: user.email,
          //   })
          // }
        }

        // Track chat interactions
        if ((window as any).Tawk_API && (window as any).Tawk_API.onChatStarted) {
          (window as any).Tawk_API.onChatStarted = function() {
            // Analytics event
            if (typeof window !== 'undefined' && (window as any).gtag) {
              (window as any).gtag('event', 'chat_started', {
                event_category: 'engagement',
                event_label: 'tawk_chat',
              })
            }
          }
        }
      }
    }

    document.body.appendChild(script)

    return () => {
      // Cleanup on unmount
      if (script.parentNode) {
        script.parentNode.removeChild(script)
      }
    }
  }, [])

  // Show development mode chat bubble if not configured
  const TAWK_PROPERTY_ID = process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID || ''
  const isConfigured = TAWK_PROPERTY_ID && TAWK_PROPERTY_ID !== 'your-tawk-property-id-here/default'

  if (!isConfigured && process.env.NODE_ENV === 'development') {
    return <DevelopmentChatBubble />
  }

  return null // This component doesn't render anything
}

// Development mode chat bubble (shows when Tawk.to not configured)
function DevelopmentChatBubble() {
  return (
    <div className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group cursor-pointer">
      <div className="flex items-center gap-3">
        <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <div className="hidden group-hover:block">
          <div className="text-sm font-semibold">Setup Tawk.to</div>
          <div className="text-xs opacity-90">Click to configure chat</div>
        </div>
      </div>
      <div className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        !
      </div>
    </div>
  )
}

// Alternative: Custom chat bubble if you don't want Tawk.to
export function CustomChatBubble() {
  const handleClick = () => {
    // Open chat or redirect to support
    if ((window as any).Tawk_API) {
      (window as any).Tawk_API.toggle()
    } else {
      // Fallback: redirect to contact page
      window.location.href = '/contact'
    }
  }

  return (
    <button
      onClick={handleClick}
      className="fixed bottom-6 right-6 z-50 bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full p-4 shadow-lg hover:shadow-xl transition-all duration-200 group"
      aria-label="Open chat"
    >
      <svg
        className="h-6 w-6"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
        />
      </svg>
      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center animate-pulse">
        !
      </span>
    </button>
  )
}