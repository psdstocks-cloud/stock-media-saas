'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Loader2 } from 'lucide-react'

interface FacebookSignInButtonProps {
  text?: string
  onSuccess?: () => void
  onError?: (error: string) => void
  className?: string
  style?: React.CSSProperties
}

export default function FacebookSignInButton({ 
  text = "Continue with Facebook",
  onSuccess,
  onError,
  className = "",
  style = {}
}: FacebookSignInButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleFacebookSignIn = async () => {
    try {
      setIsLoading(true)
      const result = await signIn('facebook', { 
        redirect: false,
        callbackUrl: '/dashboard'
      })
      
      if (result?.error) {
        console.error('Facebook sign-in error:', result.error)
        onError?.(result.error)
      } else if (result?.ok) {
        console.log('Facebook sign-in successful')
        onSuccess?.()
        // Redirect will be handled by NextAuth
        window.location.href = '/dashboard'
      }
    } catch (error) {
      console.error('Facebook sign-in error:', error)
      onError?.(error instanceof Error ? error.message : 'An error occurred')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleFacebookSignIn}
      disabled={isLoading}
      className={className}
      style={{
        width: '100%',
        padding: '12px 24px',
        background: '#1877f2',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        fontSize: '16px',
        fontWeight: '500',
        cursor: isLoading ? 'not-allowed' : 'pointer',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        opacity: isLoading ? 0.7 : 1,
        ...style
      }}
      onMouseEnter={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#166fe5'
          e.currentTarget.style.transform = 'translateY(-1px)'
          e.currentTarget.style.boxShadow = '0 4px 12px rgba(24, 119, 242, 0.3)'
        }
      }}
      onMouseLeave={(e) => {
        if (!isLoading) {
          e.currentTarget.style.background = '#1877f2'
          e.currentTarget.style.transform = 'translateY(0)'
          e.currentTarget.style.boxShadow = 'none'
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
          fill="currentColor"
          style={{ marginRight: '8px' }}
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      {text}
    </button>
  )
}
