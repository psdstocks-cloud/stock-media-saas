import { useState, useCallback, useRef } from 'react'

interface EmailValidationResult {
  available: boolean
  message: string
  hasOAuthAccounts?: boolean
  providers?: string[]
}

interface UseEmailValidationOptions {
  debounceMs?: number
  minLength?: number
}

export function useEmailValidation(options: UseEmailValidationOptions = {}) {
  const { debounceMs = 500, minLength = 5 } = options
  
  const [isChecking, setIsChecking] = useState(false)
  const [result, setResult] = useState<EmailValidationResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const debounceRef = useRef<NodeJS.Timeout | undefined>(undefined)

  const checkEmail = useCallback(async (email: string) => {
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }

    // Reset states
    setError(null)
    setResult(null)

    // Don't check if email is too short
    if (!email || email.length < minLength) {
      setResult(null)
      return
    }

    // Basic email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email.trim())) {
      setResult({
        available: false,
        message: 'Please enter a valid email address'
      })
      return
    }

    // Debounce the API call
    debounceRef.current = setTimeout(async () => {
      setIsChecking(true)
      
      try {
        const response = await fetch('/api/auth/check-email', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email: email.trim() }),
        })

        const data = await response.json()

        if (response.ok) {
          setResult(data)
        } else {
          setError(data.error || 'Failed to check email availability')
          setResult({
            available: false,
            message: data.error || 'Failed to check email availability'
          })
        }
      } catch (error) {
        console.error('Email validation error:', error)
        setError('Unable to check email availability')
        setResult({
          available: false,
          message: 'Unable to check email availability'
        })
      } finally {
        setIsChecking(false)
      }
    }, debounceMs)
  }, [debounceMs, minLength])

  const clearValidation = useCallback(() => {
    if (debounceRef.current) {
      clearTimeout(debounceRef.current)
    }
    setResult(null)
    setError(null)
    setIsChecking(false)
  }, [])

  return {
    checkEmail,
    clearValidation,
    isChecking,
    result,
    error,
    isValid: result?.available === true,
    isInvalid: result?.available === false,
    message: result?.message
  }
}
