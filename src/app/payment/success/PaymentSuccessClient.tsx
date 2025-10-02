'use client'

import { useSearchParams, useRouter } from 'next/navigation'
import { Typography, Button, Card, CardContent } from '@/components/ui'
import { CheckCircle, ArrowRight, Download, Zap, Home } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function PaymentSuccessClient() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const points = searchParams.get('points') || '0'
  
  const [countdown, setCountdown] = useState(10)

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prev) => {
        if (prev <= 1) {
          clearInterval(timer)
          router.push('/dashboard')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(timer)
  }, [router])

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-2xl mx-auto">
        <CardContent className="text-center p-8 md:p-12">
          {/* Success Icon */}
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-12 w-12 text-green-600" />
          </div>

          {/* Success Message */}
          <Typography variant="h1" className="text-3xl md:text-4xl font-bold mb-4 text-green-600">
            Payment Successful! 🎉
          </Typography>
          
          <Typography variant="h3" className="text-xl md:text-2xl text-muted-foreground mb-8">
            Your {points} points have been added to your account
          </Typography>

          {/* Points Display */}
          <div className="bg-gradient-to-r from-orange-50 to-red-50 dark:from-orange-900/20 dark:to-red-900/20 rounded-2xl p-6 border border-orange-200 dark:border-orange-800 mb-8">
            <div className="flex items-center justify-center space-x-3 mb-4">
              <Zap className="h-8 w-8 text-orange-600" />
              <Typography variant="h2" className="text-3xl font-bold text-orange-600">
                {points} Points
              </Typography>
            </div>
            <Typography variant="body" className="text-muted-foreground">
              Ready to download high-quality stock media from 25+ platforms
            </Typography>
          </div>

          {/* What's Next */}
          <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-2xl p-6 mb-8">
            <Typography variant="h4" className="font-bold text-blue-800 dark:text-blue-200 mb-4">
              What's Next?
            </Typography>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">1</span>
                </div>
                <Typography variant="body-sm" className="font-medium text-blue-800 dark:text-blue-200">
                  Browse Stock Sites
                </Typography>
                <Typography variant="body-xs" className="text-blue-600 dark:text-blue-400">
                  Explore 25+ platforms
                </Typography>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <span className="text-blue-600 dark:text-blue-300 font-bold">2</span>
                </div>
                <Typography variant="body-sm" className="font-medium text-blue-800 dark:text-blue-200">
                  Find Your Content
                </Typography>
                <Typography variant="body-xs" className="text-blue-600 dark:text-blue-400">
                  Search & select media
                </Typography>
              </div>
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-800 rounded-full flex items-center justify-center mb-2">
                  <Download className="h-6 w-6 text-blue-600 dark:text-blue-300" />
                </div>
                <Typography variant="body-sm" className="font-medium text-blue-800 dark:text-blue-200">
                  Download Instantly
                </Typography>
                <Typography variant="body-xs" className="text-blue-600 dark:text-blue-400">
                  High-quality files
                </Typography>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <Button
              size="lg"
              className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white px-8 py-3"
              onClick={() => router.push('/dashboard')}
            >
              <Zap className="mr-2 h-5 w-5" />
              Go to Dashboard
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="px-8 py-3"
              onClick={() => router.push('/')}
            >
              <Home className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </div>

          {/* Auto Redirect Notice */}
          <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
            <Typography variant="body-sm" className="text-muted-foreground">
              Automatically redirecting to dashboard in {countdown} seconds...
            </Typography>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mt-2">
              <div 
                className="bg-orange-500 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${((10 - countdown) / 10) * 100}%` }}
              />
            </div>
          </div>

          {/* Receipt Info */}
          <Typography variant="body-xs" className="text-muted-foreground mt-6">
            A receipt has been sent to your email address.
            <br />
            Order ID: #{Date.now().toString().slice(-8)}
          </Typography>
        </CardContent>
      </Card>
    </div>
  )
}
