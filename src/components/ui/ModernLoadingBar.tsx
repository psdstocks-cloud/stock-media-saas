'use client'

import { useState, useEffect } from 'react'

interface ModernLoadingBarProps {
  isVisible: boolean
  progress: number
  status: 'analyzing' | 'processing' | 'downloading' | 'completed'
  onComplete?: () => void
  onClose?: () => void
}

export function ModernLoadingBar({ isVisible, progress, status, onComplete, onClose }: ModernLoadingBarProps) {
  const [displayProgress, setDisplayProgress] = useState(0)

  useEffect(() => {
    if (isVisible) {
      setDisplayProgress(0)
    }
  }, [isVisible])

  useEffect(() => {
    if (!isVisible) return

    const interval = setInterval(() => {
      setDisplayProgress(prev => {
        if (prev >= progress) {
          clearInterval(interval)
          if (progress >= 100 && onComplete) {
            setTimeout(onComplete, 500)
          }
          return progress
        }
        return Math.min(prev + 2, progress)
      })
    }, 50)

    return () => clearInterval(interval)
  }, [progress, isVisible, onComplete])

  if (!isVisible) return null

  const getStatusText = () => {
    switch (status) {
      case 'analyzing':
        return 'Analyzing file details...'
      case 'processing':
        return 'Processing your order...'
      case 'downloading':
        return 'Generating download link...'
      case 'completed':
        return 'Download ready!'
      default:
        return 'Processing...'
    }
  }

  const getStatusIcon = () => {
    switch (status) {
      case 'analyzing':
        return '🔍'
      case 'processing':
        return '⚙️'
      case 'downloading':
        return '🔗'
      case 'completed':
        return '✅'
      default:
        return '⏳'
    }
  }

  const getStatusColor = () => {
    switch (status) {
      case 'analyzing':
        return '#3B82F6' // Blue
      case 'processing':
        return '#8B5CF6' // Purple
      case 'downloading':
        return '#F59E0B' // Amber
      case 'completed':
        return '#10B981' // Green
      default:
        return '#6B7280' // Gray
    }
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      zIndex: 9999,
      background: 'rgba(0, 0, 0, 0.8)',
      backdropFilter: 'blur(10px)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      padding: '2rem'
    }}>
      {/* Close Button */}
      {onClose && (
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '2rem',
            right: '2rem',
            background: 'rgba(255, 255, 255, 0.1)',
            border: '1px solid rgba(255, 255, 255, 0.2)',
            borderRadius: '50%',
            width: '40px',
            height: '40px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            color: 'white',
            fontSize: '1.5rem',
            transition: 'all 0.2s ease',
            zIndex: 10000
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.2)'
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.1)'
          }}
        >
          ×
        </button>
      )}

      {/* Main Container */}
      <div style={{
        background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        borderRadius: '24px',
        padding: '3rem 2rem',
        maxWidth: '500px',
        width: '100%',
        textAlign: 'center',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
      }}>
        {/* Animated Icon */}
        <div style={{
          width: '80px',
          height: '80px',
          margin: '0 auto 2rem',
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          <div style={{
            width: '60px',
            height: '60px',
            border: `3px solid ${getStatusColor()}`,
            borderTop: '3px solid transparent',
            borderRadius: '50%',
            animation: 'spin 1s linear infinite'
          }} />
          <div style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            background: getStatusColor(),
            borderRadius: '50%',
            opacity: 0.3,
            animation: 'pulse 2s ease-in-out infinite'
          }} />
        </div>

        {/* Status Text */}
        <h3 style={{
          fontSize: '1.5rem',
          fontWeight: '700',
          color: 'white',
          margin: '0 0 1rem 0',
          textShadow: '0 2px 4px rgba(0, 0, 0, 0.3)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.75rem'
        }}>
          <span style={{ fontSize: '2rem' }}>{getStatusIcon()}</span>
          {getStatusText()}
        </h3>

        {/* Progress Bar Container */}
        <div style={{
          width: '100%',
          height: '8px',
          background: 'rgba(255, 255, 255, 0.1)',
          borderRadius: '4px',
          overflow: 'hidden',
          margin: '1rem 0',
          position: 'relative'
        }}>
          {/* Progress Bar */}
          <div style={{
            width: `${displayProgress}%`,
            height: '100%',
            background: `linear-gradient(90deg, ${getStatusColor()} 0%, ${getStatusColor()}80 100%)`,
            borderRadius: '4px',
            transition: 'width 0.3s ease-out',
            position: 'relative',
            overflow: 'hidden'
          }}>
            {/* Shimmer Effect */}
            <div style={{
              position: 'absolute',
              top: 0,
              left: '-100%',
              width: '100%',
              height: '100%',
              background: 'linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.4) 50%, transparent 100%)',
              animation: 'shimmer 2s infinite'
            }} />
          </div>
        </div>

        {/* Progress Percentage */}
        <div style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: 'rgba(255, 255, 255, 0.8)',
          margin: '0.5rem 0'
        }}>
          {Math.round(displayProgress)}%
        </div>

        {/* Status Description */}
        <p style={{
          fontSize: '0.875rem',
          color: 'rgba(255, 255, 255, 0.6)',
          margin: '1rem 0 0 0',
          lineHeight: '1.5'
        }}>
          {status === 'analyzing' && 'Extracting information from the URL...'}
          {status === 'processing' && 'Validating and preparing your request...'}
          {status === 'downloading' && 'Waiting for download link generation...'}
          {status === 'completed' && 'Your download is ready!'}
        </p>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.3; }
          50% { transform: scale(1.1); opacity: 0.6; }
        }
        
        @keyframes shimmer {
          0% { left: -100%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  )
}
