'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Mail, ArrowLeft, RefreshCw, Shield, Clock } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function VerifyRequestPage() {
  const searchParams = useSearchParams()
  const email = searchParams?.get('email')
  const [mounted, setMounted] = useState(false)
  const [timeLeft, setTimeLeft] = useState(600) // 10 minutes in seconds

  // Ensure component is mounted before accessing searchParams
  useEffect(() => {
    setMounted(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    }
  }, [timeLeft])

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
        <div className="animate-pulse">
          <div className="w-16 h-16 bg-white/20 rounded-full mx-auto mb-4"></div>
          <div className="w-64 h-4 bg-white/20 rounded mx-auto mb-2"></div>
          <div className="w-48 h-4 bg-white/20 rounded mx-auto"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex items-center justify-center p-4">
      {/* Background Effects */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Main Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <Mail className="w-8 h-8 text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
            <p className="text-gray-300">We've sent you a secure sign-in link</p>
          </div>

          {/* Email Display */}
          {email && (
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-blue-400" />
                <div>
                  <p className="text-blue-300 font-medium">Sent to:</p>
                  <p className="text-blue-200 text-sm">{email}</p>
                </div>
              </div>
            </div>
          )}

          {/* Timer */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-center space-x-3">
              <Clock className="w-5 h-5 text-yellow-400" />
              <div>
                <p className="text-yellow-300 font-medium">Link expires in:</p>
                <p className="text-yellow-200 text-lg font-mono">
                  {timeLeft > 0 ? formatTime(timeLeft) : 'Expired'}
                </p>
              </div>
            </div>
          </div>

          {/* Instructions */}
          <div className="space-y-3 mb-6">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">1</span>
              </div>
              <p className="text-gray-300 text-sm">Check your email inbox (and spam folder)</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">2</span>
              </div>
              <p className="text-gray-300 text-sm">Click the "Sign In to Admin Panel" button</p>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-purple-500/20 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <span className="text-purple-400 text-sm font-bold">3</span>
              </div>
              <p className="text-gray-300 text-sm">You'll be automatically signed in</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/admin/login" className="block">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Send New Link</span>
              </button>
            </Link>

            <Link href="/admin" className="block">
              <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-6 rounded-xl transition-all duration-200 border border-white/20 flex items-center justify-center space-x-2">
                <ArrowLeft className="w-5 h-5" />
                <span>Back to Admin</span>
              </button>
            </Link>
          </div>

          {/* Security Notice */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center space-x-2 text-gray-400 text-sm">
              <Shield className="w-4 h-4" />
              <span>Secure passwordless authentication</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Didn't receive the email? Check your spam folder or try again
          </p>
        </div>
      </div>
    </div>
  )
}
