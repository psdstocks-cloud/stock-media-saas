'use client'

import { useState } from 'react'
import { Star, Send, Loader } from 'lucide-react'
import { reviewSchema } from '@/lib/validation'
import { useCSRFForm } from '@/hooks/useCSRF'

interface ReviewFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function ReviewForm({ onSuccess, onCancel }: ReviewFormProps) {
  const [formData, setFormData] = useState({
    displayName: '',
    role: '',
    industry: '',
    title: '',
    content: '',
    rating: 0,
    metrics: {
      downloadsSaved: 0,
      timeSaved: '',
      moneySaved: 0
    }
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [hoveredRating, setHoveredRating] = useState(0)
  const { csrfToken, isLoading: csrfLoading, getHeaders } = useCSRFForm()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    
    if (name.startsWith('metrics.')) {
      const metricField = name.split('.')[1]
      setFormData(prev => ({
        ...prev,
        metrics: {
          ...prev.metrics,
          [metricField]: type === 'number' ? parseInt(value) || 0 : value
        }
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) || 0 : value
      }))
    }
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }))
    }
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Validate form data
      const validatedData = reviewSchema.parse(formData)
      
      // Check CSRF token
      if (!csrfToken) {
        throw new Error('CSRF token not available')
      }
      
      // Submit review
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify({
          ...validatedData,
          _csrf: csrfToken
        })
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to submit review')
      }
      
      // Reset form
      setFormData({
        displayName: '',
        role: '',
        industry: '',
        title: '',
        content: '',
        rating: 0,
        metrics: {
          downloadsSaved: 0,
          timeSaved: '',
          moneySaved: 0
        }
      })
      
      onSuccess?.()
    } catch (error: any) {
      if (error.errors) {
        const newErrors: Record<string, string> = {}
        error.errors.forEach((err: any) => {
          newErrors[err.path[0]] = err.message
        })
        setErrors(newErrors)
      } else {
        setErrors({ general: error.message || 'An error occurred' })
      }
    } finally {
      setIsSubmitting(false)
    }
  }

  const renderStars = (rating: number, interactive: boolean = false) => {
    return Array.from({ length: 5 }, (_, i) => (
      <button
        key={i}
        type="button"
        onClick={interactive ? () => handleRatingClick(i + 1) : undefined}
        onMouseEnter={interactive ? () => setHoveredRating(i + 1) : undefined}
        onMouseLeave={interactive ? () => setHoveredRating(0) : undefined}
        style={{
          background: 'none',
          border: 'none',
          cursor: interactive ? 'pointer' : 'default',
          padding: '4px'
        }}
      >
        <Star
          size={24}
          fill={
            i < (interactive ? (hoveredRating || rating) : rating)
              ? '#fbbf24'
              : '#e5e7eb'
          }
          className={
            i < (interactive ? (hoveredRating || rating) : rating)
              ? 'text-yellow-400'
              : 'text-gray-300'
          }
        />
      </button>
    ))
  }

  if (csrfLoading) {
    return (
      <div style={{
        background: 'white',
        padding: '48px',
        borderRadius: '12px',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
        textAlign: 'center'
      }}>
        <Loader size={32} style={{ animation: 'spin 1s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: '#64748b' }}>Loading form...</p>
      </div>
    )
  }

  return (
    <div style={{
      background: 'white',
      padding: '48px',
      borderRadius: '12px',
      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      maxWidth: '600px',
      margin: '0 auto'
    }}>
      <h2 style={{
        fontSize: '24px',
        fontWeight: 'bold',
        color: '#0f172a',
        marginBottom: '32px',
        textAlign: 'center'
      }}>
        Share Your Experience
      </h2>

      {errors.general && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px'
        }}>
          {errors.general}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        {/* Rating */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Rating *
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {renderStars(formData.rating, true)}
            <span style={{ color: '#64748b', fontSize: '14px' }}>
              {formData.rating > 0 && `${formData.rating} star${formData.rating > 1 ? 's' : ''}`}
            </span>
          </div>
          {errors.rating && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {errors.rating}
            </p>
          )}
        </div>

        {/* Display Name */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Display Name *
          </label>
          <input
            type="text"
            name="displayName"
            value={formData.displayName}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.displayName ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="How should we display your name?"
          />
          {errors.displayName && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {errors.displayName}
            </p>
          )}
        </div>

        {/* Role and Industry */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Your Role *
            </label>
            <input
              type="text"
              name="role"
              value={formData.role}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.role ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="e.g., Creative Director"
            />
            {errors.role && (
              <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
                {errors.role}
              </p>
            )}
          </div>
          <div>
            <label style={{
              display: 'block',
              fontSize: '16px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Industry *
            </label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              style={{
                width: '100%',
                padding: '12px 16px',
                border: `1px solid ${errors.industry ? '#dc2626' : '#d1d5db'}`,
                borderRadius: '8px',
                fontSize: '16px',
                outline: 'none'
              }}
              placeholder="e.g., Marketing Agency"
            />
            {errors.industry && (
              <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
                {errors.industry}
              </p>
            )}
          </div>
        </div>

        {/* Title */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Review Title *
          </label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.title ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none'
            }}
            placeholder="Summarize your experience"
          />
          {errors.title && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {errors.title}
            </p>
          )}
        </div>

        {/* Content */}
        <div style={{ marginBottom: '24px' }}>
          <label style={{
            display: 'block',
            fontSize: '16px',
            fontWeight: '500',
            color: '#374151',
            marginBottom: '8px'
          }}>
            Your Review *
          </label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            rows={6}
            style={{
              width: '100%',
              padding: '12px 16px',
              border: `1px solid ${errors.content ? '#dc2626' : '#d1d5db'}`,
              borderRadius: '8px',
              fontSize: '16px',
              outline: 'none',
              resize: 'vertical'
            }}
            placeholder="Tell us about your experience with StockMedia Pro..."
          />
          {errors.content && (
            <p style={{ color: '#dc2626', fontSize: '14px', marginTop: '4px' }}>
              {errors.content}
            </p>
          )}
        </div>

        {/* Metrics (Optional) */}
        <div style={{ marginBottom: '32px' }}>
          <h3 style={{
            fontSize: '18px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '16px'
          }}>
            Impact Metrics (Optional)
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px' }}>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Downloads Saved
              </label>
              <input
                type="number"
                name="metrics.downloadsSaved"
                value={formData.metrics.downloadsSaved}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="0"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Time Saved
              </label>
              <input
                type="text"
                name="metrics.timeSaved"
                value={formData.metrics.timeSaved}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="e.g., 10 hours/week"
              />
            </div>
            <div>
              <label style={{
                display: 'block',
                fontSize: '14px',
                fontWeight: '500',
                color: '#374151',
                marginBottom: '8px'
              }}>
                Money Saved ($)
              </label>
              <input
                type="number"
                name="metrics.moneySaved"
                value={formData.metrics.moneySaved}
                onChange={handleChange}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '8px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="0"
              />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: '16px', justifyContent: 'flex-end' }}>
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              style={{
                padding: '12px 24px',
                background: 'transparent',
                color: '#64748b',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '16px'
              }}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={isSubmitting || !csrfToken}
            style={{
              padding: '12px 24px',
              background: isSubmitting || !csrfToken ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting || !csrfToken ? 'not-allowed' : 'pointer',
              fontSize: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '8px'
            }}
          >
            {isSubmitting ? (
              <>
                <Loader size={16} style={{ animation: 'spin 1s linear infinite' }} />
                Submitting...
              </>
            ) : (
              <>
                <Send size={16} />
                Submit Review
              </>
            )}
          </button>
        </div>
      </form>

      <style jsx>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  )
}
