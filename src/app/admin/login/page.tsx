'use client'

import React, { useState } from 'react'
import { useFormState } from 'react-dom'
import { authenticateAdmin } from '@/actions/adminLoginAction'
import {
  Mail,
  Send,
  CheckCircle,
  AlertCircle,
  Loader2,
  Shield,
  ArrowRight,
  Sparkles,
} from 'lucide-react'

type LoginState = 'default' | 'loading' | 'success' | 'error'

export default function AdminLoginPage() {
  const [loginState, setLoginState] = useState<LoginState>('default')
  const [result, dispatch] = useFormState(authenticateAdmin, undefined)

  // Handle form submission
  const handleSubmit = async (formData: FormData) => {
    setLoginState('loading')
    await dispatch(formData)
  }

  // Handle result changes
  React.useEffect(() => {
    if (result) {
      if (result.success) {
        setLoginState('success')
      } else {
        setLoginState('error')
      }
    }
  }, [result])

  // Add CSS animations
  React.useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes float {
        0%, 100% { transform: translateY(0px) rotate(0deg); }
        50% { transform: translateY(-20px) rotate(180deg); }
      }
      
      @keyframes sparkle {
        0%, 100% { opacity: 1; transform: scale(1); }
        50% { opacity: 0.5; transform: scale(1.2); }
      }
      
      @keyframes spin {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      
      input:focus {
        border-color: #667eea !important;
        box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1) !important;
      }
      
      input::placeholder {
        color: #666 !important;
      }
    `
    document.head.appendChild(style)
    
    return () => {
      document.head.removeChild(style)
    }
  }, [])

  // Reset form state
  const resetForm = () => {
    setLoginState('default')
  }

  return (
    <div style={container}>
      {/* Background Elements */}
      <div style={backgroundElements}>
        <div style={gradient1}></div>
        <div style={gradient2}></div>
        <div style={gradient3}></div>
      </div>

      {/* Main Card */}
      <div style={card}>
        {/* Header */}
        <div style={header}>
          <div style={logoContainer}>
            <Shield size={32} style={logoIcon} />
            <Sparkles size={20} style={sparkleIcon} />
          </div>
          <h1 style={title}>Admin Access</h1>
          <p style={subtitle}>Enter your email to receive a secure login link</p>
        </div>

        {/* Form Content */}
        <div style={content}>
          {loginState === 'default' && (
            <form action={handleSubmit} style={form}>
              <div style={inputGroup}>
                <div style={inputContainer}>
                  <Mail size={20} style={inputIcon} />
                  <input
                    type="email"
                    name="email"
                    placeholder="admin@example.com"
                    required
                    style={input}
                    autoComplete="email"
                  />
                </div>
              </div>

              <button type="submit" style={submitButton}>
                <Send size={20} />
                Send Magic Link
                <ArrowRight size={16} />
              </button>
            </form>
          )}

          {loginState === 'loading' && (
            <div style={stateContainer}>
              <div style={loadingContainer}>
                <Loader2 size={32} style={loadingIcon} />
                <h3 style={stateTitle}>Sending Magic Link...</h3>
                <p style={stateText}>Please wait while we prepare your secure login link</p>
              </div>
            </div>
          )}

          {loginState === 'success' && (
            <div style={stateContainer}>
              <div style={successContainer}>
                <CheckCircle size={48} style={successIcon} />
                <h3 style={stateTitle}>Check Your Inbox!</h3>
                <p style={stateText}>
                  A secure login link has been sent to your email address. 
                  Click the link to access the admin panel.
                </p>
                <div style={securityNote}>
                  <Shield size={16} />
                  <span>This link will expire in 10 minutes for security</span>
                </div>
                <button onClick={resetForm} style={resetButton}>
                  Send Another Link
                </button>
              </div>
            </div>
          )}

          {loginState === 'error' && (
            <div style={stateContainer}>
              <div style={errorContainer}>
                <AlertCircle size={48} style={errorIcon} />
                <h3 style={stateTitle}>Access Denied</h3>
                <p style={stateText}>
                  {result?.message || 'This email address is not authorized for admin access.'}
                </p>
                <button onClick={resetForm} style={resetButton}>
                  Try Different Email
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={footer}>
          <p style={footerText}>
            <Shield size={14} />
            Secure passwordless authentication
          </p>
        </div>
      </div>
    </div>
  )
}

// Styles
const container = {
  minHeight: '100vh',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '20px',
  background: 'linear-gradient(135deg, #0f0f23 0%, #1a1a2e 50%, #16213e 100%)',
  position: 'relative' as const,
  overflow: 'hidden',
}

const backgroundElements = {
  position: 'absolute' as const,
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  overflow: 'hidden',
  zIndex: 0,
}

const gradient1 = {
  position: 'absolute' as const,
  top: '-50%',
  left: '-50%',
  width: '200%',
  height: '200%',
  background: 'radial-gradient(circle, rgba(102, 126, 234, 0.1) 0%, transparent 70%)',
  animation: 'float 20s ease-in-out infinite',
}

const gradient2 = {
  position: 'absolute' as const,
  top: '-30%',
  right: '-30%',
  width: '160%',
  height: '160%',
  background: 'radial-gradient(circle, rgba(118, 75, 162, 0.1) 0%, transparent 70%)',
  animation: 'float 25s ease-in-out infinite reverse',
}

const gradient3 = {
  position: 'absolute' as const,
  bottom: '-40%',
  left: '20%',
  width: '120%',
  height: '120%',
  background: 'radial-gradient(circle, rgba(59, 130, 246, 0.1) 0%, transparent 70%)',
  animation: 'float 30s ease-in-out infinite',
}

const card = {
  position: 'relative' as const,
  zIndex: 1,
  width: '100%',
  maxWidth: '420px',
  background: 'rgba(255, 255, 255, 0.05)',
  backdropFilter: 'blur(20px)',
  borderRadius: '24px',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  boxShadow: '0 25px 50px rgba(0, 0, 0, 0.3)',
  overflow: 'hidden',
}

const header = {
  textAlign: 'center' as const,
  padding: '40px 32px 32px',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}

const logoContainer = {
  position: 'relative' as const,
  display: 'inline-block',
  marginBottom: '16px',
}

const logoIcon = {
  color: '#667eea',
  filter: 'drop-shadow(0 0 20px rgba(102, 126, 234, 0.5))',
}

const sparkleIcon = {
  position: 'absolute' as const,
  top: '-8px',
  right: '-8px',
  color: '#ffd700',
  animation: 'sparkle 2s ease-in-out infinite',
}

const title = {
  fontSize: '28px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0 0 8px',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  WebkitBackgroundClip: 'text',
  WebkitTextFillColor: 'transparent',
  backgroundClip: 'text',
}

const subtitle = {
  fontSize: '16px',
  color: '#a0a0a0',
  margin: '0',
  lineHeight: '1.5',
}

const content = {
  padding: '32px',
}

const form = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '24px',
}

const inputGroup = {
  display: 'flex',
  flexDirection: 'column' as const,
  gap: '8px',
}

const inputContainer = {
  position: 'relative' as const,
  display: 'flex',
  alignItems: 'center',
}

const inputIcon = {
  position: 'absolute' as const,
  left: '16px',
  color: '#667eea',
  zIndex: 1,
}

const input = {
  width: '100%',
  padding: '16px 16px 16px 48px',
  fontSize: '16px',
  color: '#ffffff',
  background: 'rgba(255, 255, 255, 0.05)',
  border: '1px solid rgba(255, 255, 255, 0.1)',
  borderRadius: '12px',
  outline: 'none',
  transition: 'all 0.3s ease',
  '&:focus': {
    borderColor: '#667eea',
    boxShadow: '0 0 0 3px rgba(102, 126, 234, 0.1)',
  },
  '&::placeholder': {
    color: '#666',
  },
}

const submitButton = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  padding: '16px 24px',
  fontSize: '16px',
  fontWeight: '600',
  color: '#ffffff',
  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
  border: 'none',
  borderRadius: '12px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  boxShadow: '0 4px 15px rgba(102, 126, 234, 0.4)',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 8px 25px rgba(102, 126, 234, 0.6)',
  },
  '&:active': {
    transform: 'translateY(0)',
  },
}

const stateContainer = {
  textAlign: 'center' as const,
  padding: '20px 0',
}

const loadingContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '16px',
}

const successContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '16px',
}

const errorContainer = {
  display: 'flex',
  flexDirection: 'column' as const,
  alignItems: 'center',
  gap: '16px',
}

const loadingIcon = {
  color: '#667eea',
  animation: 'spin 1s linear infinite',
}

const successIcon = {
  color: '#10b981',
  filter: 'drop-shadow(0 0 20px rgba(16, 185, 129, 0.5))',
}

const errorIcon = {
  color: '#ef4444',
  filter: 'drop-shadow(0 0 20px rgba(239, 68, 68, 0.5))',
}

const stateTitle = {
  fontSize: '20px',
  fontWeight: 'bold',
  color: '#ffffff',
  margin: '0',
}

const stateText = {
  fontSize: '16px',
  color: '#a0a0a0',
  margin: '0',
  lineHeight: '1.5',
  maxWidth: '300px',
}

const securityNote = {
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  padding: '12px 16px',
  background: 'rgba(16, 185, 129, 0.1)',
  border: '1px solid rgba(16, 185, 129, 0.3)',
  borderRadius: '8px',
  fontSize: '14px',
  color: '#10b981',
}

const resetButton = {
  padding: '12px 24px',
  fontSize: '14px',
  fontWeight: '600',
  color: '#667eea',
  background: 'rgba(102, 126, 234, 0.1)',
  border: '1px solid rgba(102, 126, 234, 0.3)',
  borderRadius: '8px',
  cursor: 'pointer',
  transition: 'all 0.3s ease',
  '&:hover': {
    background: 'rgba(102, 126, 234, 0.2)',
    borderColor: 'rgba(102, 126, 234, 0.5)',
  },
}

const footer = {
  padding: '24px 32px',
  textAlign: 'center' as const,
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
}

const footerText = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  gap: '8px',
  fontSize: '14px',
  color: '#666',
  margin: '0',
}

