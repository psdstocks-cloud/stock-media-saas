'use client'

import { useState, useEffect } from 'react'

interface CSRFResponse {
  csrfToken: string
  expiresIn: number
}

export function useCSRF() {
  const [csrfToken, setCsrfToken] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCSRFToken = async () => {
    setIsLoading(true)
    setError(null)
    
    try {
      const response = await fetch('/api/csrf', {
        method: 'GET',
        credentials: 'include'
      })
      
      if (!response.ok) {
        throw new Error('Failed to fetch CSRF token')
      }
      
      const data: CSRFResponse = await response.json()
      setCsrfToken(data.csrfToken)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchCSRFToken()
  }, [])

  const refreshToken = () => {
    fetchCSRFToken()
  }

  return {
    csrfToken,
    isLoading,
    error,
    refreshToken
  }
}

// Hook for forms that need CSRF protection
export function useCSRFForm() {
  const { csrfToken, isLoading, error, refreshToken } = useCSRF()
  
  const getFormData = (formData: FormData): FormData => {
    const newFormData = new FormData()
    
    // Copy all form data
    for (const [key, value] of formData.entries()) {
      newFormData.append(key, value)
    }
    
    // Add CSRF token
    if (csrfToken) {
      newFormData.append('_csrf', csrfToken)
    }
    
    return newFormData
  }
  
  const getHeaders = () => {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json'
    }
    
    if (csrfToken) {
      headers['X-CSRF-Token'] = csrfToken
    }
    
    return headers
  }
  
  return {
    csrfToken,
    isLoading,
    error,
    refreshToken,
    getFormData,
    getHeaders
  }
}
