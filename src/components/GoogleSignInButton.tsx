'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface GoogleSignInButtonProps {
  text?: string
  className?: string
  style?: React.CSSProperties
  onSuccess?: () => void
  onError?: (error: string) => void
}

export default function GoogleSignInButton({ 
  text = "Continue with Google",
  className = "",
  style = {},
  onSuccess,
  onError
}: GoogleSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('google', { 
        redirect: false,
        callbackUrl: '/dashboard'
      })
      
      if (result?.error) {
        onError?.(result.error)
      } else if (result?.ok) {
        onSuccess?.()
        // Redirect to dashboard
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Google sign-in error:', error)
      onError?.('An error occurred during sign-in')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleGoogleSignIn}
      disabled={isLoading}
      className={`google-signin-button ${className}`}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '12px',
        width: '100%',
        padding: '12px 24px',
        background: 'white',
        color: '#374151',
        border: '2px solid #e5e7eb',
        borderRadius: '8px',
        fontSize: '14px',
        fontWeight: '500',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        opacity: isLoading ? 0.7 : 1,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#f9fafb'
          e.currentTarget.style.borderColor = '#d1d5db'
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = 'white'
          e.currentTarget.style.borderColor = '#e5e7eb'
        }
      }}
    >
      {isLoading ? (
        <Loader2 size={20} className="animate-spin" />
      ) : (
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
      )}
      <span>{text}</span>
    </button>
  )
}
