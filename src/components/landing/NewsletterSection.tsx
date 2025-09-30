'use client'

import { useState } from 'react'
import { Typography, Button, Input } from '@/components/ui'
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export function NewsletterSection() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validate email
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setStatus('error')
      setMessage('Please enter a valid email address')
      return
    }

    setStatus('loading')
    setMessage('')

    try {
      const response = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage('Thanks for subscribing! Check your email for confirmation.')
        setEmail('')
        
        // Track conversion (if analytics is set up)
        if (typeof window !== 'undefined' && (window as any).gtag) {
          (window as any).gtag('event', 'newsletter_signup', {
            event_category: 'engagement',
            event_label: 'newsletter',
          })
        }
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch (error) {
      setStatus('error')
      setMessage('Network error. Please check your connection and try again.')
    }
  }

  return (
    <section className="py-16 bg-gradient-to-br from-orange-50 to-purple-50 dark:from-orange-950/20 dark:to-purple-950/20">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center">
          {/* Icon */}
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gradient-to-r from-orange-500 to-orange-600 mb-6">
            <Mail className="h-8 w-8 text-white" />
          </div>

          {/* Headline */}
          <Typography variant="h2" className="text-3xl md:text-4xl font-bold mb-4">
            Stay Updated with the Latest
          </Typography>
          
          <Typography variant="body-lg" className="text-[hsl(var(--muted-foreground))] mb-8 max-w-2xl mx-auto">
            Get exclusive access to new features, premium stock updates, special offers, and expert tips delivered to your inbox weekly.
          </Typography>

          {/* Form */}
          <form onSubmit={handleSubmit} className="max-w-md mx-auto mb-6">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="flex-1 h-12 text-base"
                aria-label="Email address"
              />
              <Button
                type="submit"
                disabled={status === 'loading' || status === 'success'}
                className={cn(
                  "h-12 px-8 font-semibold",
                  status === 'success' 
                    ? "bg-green-600 hover:bg-green-700" 
                    : "bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                )}
              >
                {status === 'loading' && (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                )}
                {status === 'success' && (
                  <CheckCircle className="h-4 w-4 mr-2" />
                )}
                {status === 'loading' ? 'Subscribing...' : status === 'success' ? 'Subscribed!' : 'Subscribe'}
              </Button>
            </div>

            {/* Status Messages */}
            {message && (
              <div className={cn(
                "mt-4 p-3 rounded-lg flex items-start gap-2 text-sm",
                status === 'success' 
                  ? "bg-green-50 dark:bg-green-950/20 text-green-800 dark:text-green-300 border border-green-200 dark:border-green-800"
                  : "bg-red-50 dark:bg-red-950/20 text-red-800 dark:text-red-300 border border-red-200 dark:border-red-800"
              )}>
                {status === 'success' ? (
                  <CheckCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
                )}
                <span>{message}</span>
              </div>
            )}
          </form>

          {/* Trust Signals */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 text-sm text-[hsl(var(--muted-foreground))]">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>10,000+ subscribers</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Weekly updates</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-4 w-4 text-green-500" />
              <span>Unsubscribe anytime</span>
            </div>
          </div>

          {/* Privacy Notice */}
          <Typography variant="body-sm" className="text-[hsl(var(--muted-foreground))] mt-4">
            We respect your privacy. No spam, ever. Read our{' '}
            <a href="/privacy" className="text-orange-500 hover:text-orange-600 underline">
              privacy policy
            </a>
            .
          </Typography>
        </div>
      </div>
    </section>
  )
}
