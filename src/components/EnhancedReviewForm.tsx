'use client'

import { useState, useEffect, useRef } from 'react'
import { Star, Send, Loader, Shield, AlertTriangle, CheckCircle, Eye, EyeOff } from 'lucide-react'
import { reviewSchema } from '@/lib/validation'
import { useCSRFForm } from '@/hooks/useCSRF'

interface EnhancedReviewFormProps {
  onSuccess?: () => void
  onCancel?: () => void
}

export default function EnhancedReviewForm({ onSuccess, onCancel }: EnhancedReviewFormProps) {
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
  const [showSpamWarning, setShowSpamWarning] = useState(false)
  const [spamScore, setSpamScore] = useState(0)
  const [isHuman, setIsHuman] = useState(false)
  const [captchaAnswer, setCaptchaAnswer] = useState('')
  const [captchaQuestion, setCaptchaQuestion] = useState('')
  const [captchaCorrect, setCaptchaCorrect] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [password, setPassword] = useState('')
  const [timeOnPage, setTimeOnPage] = useState(0)
  const [keystrokes, setKeystrokes] = useState(0)
  const [mouseMovements, setMouseMovements] = useState(0)
  const [formStartTime, setFormStartTime] = useState(Date.now())
  
  const { csrfToken, isLoading: csrfLoading, getHeaders } = useCSRFForm()
  const formRef = useRef<HTMLFormElement>(null)
  const mouseMoveRef = useRef(0)

  // Generate simple math captcha
  useEffect(() => {
    const num1 = Math.floor(Math.random() * 10) + 1
    const num2 = Math.floor(Math.random() * 10) + 1
    setCaptchaQuestion(`${num1} + ${num2} = ?`)
    setCaptchaCorrect(false)
  }, [])

  // Track time on page
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeOnPage(Math.floor((Date.now() - formStartTime) / 1000))
    }, 1000)
    return () => clearInterval(interval)
  }, [formStartTime])

  // Track mouse movements
  useEffect(() => {
    const handleMouseMove = () => {
      setMouseMovements(prev => prev + 1)
    }
    document.addEventListener('mousemove', handleMouseMove)
    return () => document.removeEventListener('mousemove', handleMouseMove)
  }, [])

  // Track keystrokes
  useEffect(() => {
    const handleKeyPress = () => {
      setKeystrokes(prev => prev + 1)
    }
    document.addEventListener('keydown', handleKeyPress)
    return () => document.removeEventListener('keydown', handleKeyPress)
  }, [])

  // Spam detection algorithm
  const detectSpam = (text: string) => {
    let score = 0
    const spamIndicators = [
      /\b(?:free|cheap|discount|sale|offer|deal|promo|win|prize|click|here|now|urgent|limited|act\s+now)\b/gi,
      /(?:\.{3,}|!{3,}|\?{3,})/g,
      /\b(?:amazing|incredible|fantastic|awesome|perfect|best|greatest|number\s+one)\b/gi,
      /(?:http|www\.|\.com|\.net|\.org)/gi,
      /\b(?:buy|purchase|order|shop|store|money|cash|profit|earn|make\s+money)\b/gi,
      /(?:spam|scam|fake|fraud|hack|crack|virus|malware)/gi
    ]

    spamIndicators.forEach(pattern => {
      const matches = text.match(pattern)
      if (matches) score += matches.length * 2
    })

    // Check for excessive repetition
    const words = text.toLowerCase().split(/\s+/)
    const wordCount: Record<string, number> = {}
    words.forEach(word => {
      wordCount[word] = (wordCount[word] || 0) + 1
    })
    
    Object.values(wordCount).forEach(count => {
      if (count > 3) score += count - 3
    })

    // Check for all caps
    const capsRatio = (text.match(/[A-Z]/g) || []).length / text.length
    if (capsRatio > 0.3) score += 5

    // Check for excessive punctuation
    const punctRatio = (text.match(/[!?.]{2,}/g) || []).length / text.length
    if (punctRatio > 0.1) score += 3

    return Math.min(score, 100)
  }

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

    // Spam detection for content
    if (name === 'content') {
      const score = detectSpam(value)
      setSpamScore(score)
      setShowSpamWarning(score > 30)
    }
  }

  const handleRatingClick = (rating: number) => {
    setFormData(prev => ({ ...prev, rating }))
    if (errors.rating) {
      setErrors(prev => ({ ...prev, rating: '' }))
    }
  }

  const handleCaptchaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const answer = e.target.value
    setCaptchaAnswer(answer)
    
    const [num1, num2] = captchaQuestion.split(' + ')[0].split(' = ')[0].split(' + ')
    const correctAnswer = parseInt(num1) + parseInt(num2)
    setCaptchaCorrect(parseInt(answer) === correctAnswer)
  }

  const validateHumanBehavior = () => {
    // Check if user has spent enough time on form
    if (timeOnPage < 30) return false
    
    // Check if user has interacted enough
    if (keystrokes < 20) return false
    
    // Check if user has moved mouse
    if (mouseMovements < 10) return false
    
    // Check if form was filled at human-like pace
    const avgTimePerField = timeOnPage / 6 // Assuming 6 main fields
    if (avgTimePerField < 2) return false
    
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrors({})

    try {
      // Human behavior validation
      if (!validateHumanBehavior()) {
        throw new Error('Please take your time to fill out the form properly')
      }

      // Captcha validation
      if (!captchaCorrect) {
        throw new Error('Please solve the math problem correctly')
      }

      // Spam score validation
      if (spamScore > 50) {
        throw new Error('Your review appears to be spam. Please write a genuine review.')
      }

      // Password validation (simple anti-bot measure)
      if (password !== 'review2024') {
        throw new Error('Please enter the correct password to submit your review')
      }

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
          _csrf: csrfToken,
          behaviorData: {
            timeOnPage,
            keystrokes,
            mouseMovements,
            spamScore
          }
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
      maxWidth: '700px',
      margin: '0 auto'
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '32px',
        padding: '16px',
        background: '#f8fafc',
        borderRadius: '8px',
        border: '1px solid #e2e8f0'
      }}>
        <Shield size={24} style={{ color: '#10b981' }} />
        <div>
          <h2 style={{
            fontSize: '20px',
            fontWeight: 'bold',
            color: '#0f172a',
            margin: 0
          }}>
            Secure Review Submission
          </h2>
          <p style={{
            fontSize: '14px',
            color: '#64748b',
            margin: '4px 0 0 0'
          }}>
            Your review will be moderated before publication to ensure quality
          </p>
        </div>
      </div>

      {errors.general && (
        <div style={{
          background: '#fef2f2',
          border: '1px solid #fecaca',
          color: '#dc2626',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          {errors.general}
        </div>
      )}

      {showSpamWarning && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #f59e0b',
          color: '#92400e',
          padding: '12px 16px',
          borderRadius: '8px',
          marginBottom: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <AlertTriangle size={16} />
          <span>Your review content appears to be promotional. Please write a genuine, honest review.</span>
        </div>
      )}

      <form ref={formRef} onSubmit={handleSubmit}>
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
          {spamScore > 0 && (
            <div style={{
              marginTop: '8px',
              fontSize: '12px',
              color: spamScore > 30 ? '#dc2626' : '#64748b'
            }}>
              Content quality score: {100 - spamScore}/100
            </div>
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

        {/* Security Measures */}
        <div style={{
          background: '#f8fafc',
          padding: '24px',
          borderRadius: '8px',
          border: '1px solid #e2e8f0',
          marginBottom: '32px'
        }}>
          <h3 style={{
            fontSize: '16px',
            fontWeight: '600',
            color: '#0f172a',
            marginBottom: '16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <Shield size={16} />
            Security Verification
          </h3>
          
          {/* Math Captcha */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Math Verification *
            </label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{
                padding: '8px 12px',
                background: '#e5e7eb',
                borderRadius: '6px',
                fontSize: '16px',
                fontWeight: '600'
              }}>
                {captchaQuestion}
              </span>
              <input
                type="number"
                value={captchaAnswer}
                onChange={handleCaptchaChange}
                style={{
                  padding: '8px 12px',
                  border: `1px solid ${captchaCorrect ? '#10b981' : '#d1d5db'}`,
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none',
                  width: '80px'
                }}
                placeholder="?"
              />
              {captchaCorrect && (
                <CheckCircle size={20} style={{ color: '#10b981' }} />
              )}
            </div>
          </div>

          {/* Password Verification */}
          <div style={{ marginBottom: '16px' }}>
            <label style={{
              display: 'block',
              fontSize: '14px',
              fontWeight: '500',
              color: '#374151',
              marginBottom: '8px'
            }}>
              Verification Password *
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '8px 12px',
                  paddingRight: '40px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '16px',
                  outline: 'none'
                }}
                placeholder="Enter: review2024"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p style={{
              fontSize: '12px',
              color: '#64748b',
              margin: '4px 0 0 0'
            }}>
              Enter "review2024" to verify you're human
            </p>
          </div>

          {/* Behavior Tracking */}
          <div style={{
            fontSize: '12px',
            color: '#64748b',
            display: 'grid',
            gridTemplateColumns: '1fr 1fr 1fr',
            gap: '8px'
          }}>
            <div>Time: {timeOnPage}s</div>
            <div>Keystrokes: {keystrokes}</div>
            <div>Mouse: {mouseMovements}</div>
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
            disabled={isSubmitting || !csrfToken || !captchaCorrect || password !== 'review2024'}
            style={{
              padding: '12px 24px',
              background: isSubmitting || !csrfToken || !captchaCorrect || password !== 'review2024' ? '#9ca3af' : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: isSubmitting || !csrfToken || !captchaCorrect || password !== 'review2024' ? 'not-allowed' : 'pointer',
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
