'use client'

import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { AlertCircle, ArrowLeft, RefreshCw, Shield } from 'lucide-react'
import { useEffect, useState } from 'react'

export default function AuthErrorPage() {
  const searchParams = useSearchParams()
  const error = searchParams.get('error')
  const [mounted, setMounted] = useState(false)

  // Ensure component is mounted before accessing searchParams
  useEffect(() => {
    setMounted(true)
  }, [])

  const errorMessages: { [key: string]: { title: string; message: string; icon: string } } = {
    Verification: {
      title: 'Link Expired or Used',
      message: 'The sign-in link is no longer valid. It may have been used already or has expired. Please request a new one.',
      icon: '⏰'
    },
    Configuration: {
      title: 'Server Error',
      message: 'There is a problem with the server configuration. Please contact support if this persists.',
      icon: '⚙️'
    },
    AccessDenied: {
      title: 'Access Denied',
      message: 'You do not have permission to access the admin panel. Please contact your administrator.',
      icon: '🚫'
    },
    Default: {
      title: 'Authentication Error',
      message: 'An unexpected error occurred during sign-in. Please try again.',
      icon: '❌'
    }
  }

  const errorInfo = error ? (errorMessages[error] || errorMessages.Default) : errorMessages.Default

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
        {/* Error Card */}
        <div className="bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl">
          {/* Header */}
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-400" />
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Authentication Error</h1>
            <p className="text-gray-300">Unable to complete sign-in process</p>
          </div>

          {/* Error Details */}
          <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6">
            <div className="flex items-start space-x-3">
              <span className="text-2xl">{errorInfo.icon}</span>
              <div>
                <h3 className="font-semibold text-red-300 mb-1">{errorInfo.title}</h3>
                <p className="text-red-200/80 text-sm leading-relaxed">{errorInfo.message}</p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            <Link href="/admin/login" className="block">
              <button className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 transform hover:scale-105 hover:shadow-lg flex items-center justify-center space-x-2">
                <RefreshCw className="w-5 h-5" />
                <span>Try Again</span>
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
              <span>Secure admin authentication</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-gray-400 text-sm">
            Need help? Contact your system administrator
          </p>
        </div>
      </div>
    </div>
  )
}
