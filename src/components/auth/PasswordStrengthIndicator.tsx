'use client'

import { useMemo } from 'react'
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react'

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

interface PasswordRequirement {
  id: string
  label: string
  test: (password: string) => boolean
  regex?: RegExp
}

const passwordRequirements: PasswordRequirement[] = [
  {
    id: 'length',
    label: 'At least 8 characters',
    test: (password: string) => password.length >= 8,
    regex: /.{8,}/
  },
  {
    id: 'uppercase',
    label: 'One uppercase letter',
    test: (password: string) => /[A-Z]/.test(password),
    regex: /[A-Z]/
  },
  {
    id: 'lowercase',
    label: 'One lowercase letter',
    test: (password: string) => /[a-z]/.test(password),
    regex: /[a-z]/
  },
  {
    id: 'number',
    label: 'One number',
    test: (password: string) => /\d/.test(password),
    regex: /\d/
  },
  {
    id: 'special',
    label: 'One special character',
    test: (password: string) => /[^A-Za-z0-9]/.test(password),
    regex: /[^A-Za-z0-9]/
  }
]

export default function PasswordStrengthIndicator({ password, className = '' }: PasswordStrengthIndicatorProps) {
  const strengthData = useMemo(() => {
    if (!password) {
      return {
        score: 0,
        level: 'none',
        requirements: passwordRequirements.map(req => ({
          ...req,
          met: false
        }))
      }
    }

    const requirements = passwordRequirements.map(req => ({
      ...req,
      met: req.test(password)
    }))

    const metCount = requirements.filter(req => req.met).length
    const totalCount = requirements.length
    
    // Calculate strength score (0-100)
    const score = Math.round((metCount / totalCount) * 100)
    
    // Determine strength level
    let level: 'weak' | 'fair' | 'good' | 'strong' | 'none' = 'none'
    if (score >= 80) level = 'strong'
    else if (score >= 60) level = 'good'
    else if (score >= 40) level = 'fair'
    else if (score > 0) level = 'weak'

    return {
      score,
      level,
      requirements
    }
  }, [password])

  const getStrengthColor = (level: string) => {
    switch (level) {
      case 'strong':
        return 'from-green-500 to-green-600'
      case 'good':
        return 'from-blue-500 to-blue-600'
      case 'fair':
        return 'from-yellow-500 to-yellow-600'
      case 'weak':
        return 'from-red-500 to-red-600'
      default:
        return 'from-gray-300 to-gray-400'
    }
  }

  const getStrengthLabel = (level: string) => {
    switch (level) {
      case 'strong':
        return 'Strong'
      case 'good':
        return 'Good'
      case 'fair':
        return 'Fair'
      case 'weak':
        return 'Weak'
      default:
        return 'Enter password'
    }
  }

  const getRequirementIcon = (met: boolean) => {
    if (met) {
      return <CheckCircle className="h-4 w-4 text-green-500" />
    }
    return <XCircle className="h-4 w-4 text-red-400" />
  }

  const getRequirementTextColor = (met: boolean) => {
    return met ? 'text-green-400' : 'text-red-400'
  }

  // Don't show indicator if password is empty
  if (!password) {
    return null
  }

  return (
    <div className={`space-y-3 ${className}`}>
      {/* Strength Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-white/70">Password Strength</span>
          <span className={`text-sm font-semibold ${
            strengthData.level === 'strong' ? 'text-green-400' :
            strengthData.level === 'good' ? 'text-blue-400' :
            strengthData.level === 'fair' ? 'text-yellow-400' :
            strengthData.level === 'weak' ? 'text-red-400' :
            'text-gray-400'
          }`}>
            {getStrengthLabel(strengthData.level)}
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2">
          <div 
            className={`h-2 rounded-full bg-gradient-to-r ${getStrengthColor(strengthData.level)} transition-all duration-300 ease-in-out`}
            style={{ width: `${strengthData.score}%` }}
          />
        </div>
      </div>

      {/* Requirements List */}
      <div className="space-y-2">
        <span className="text-sm font-medium text-white/70">Requirements:</span>
        <div className="grid grid-cols-1 gap-1.5">
          {strengthData.requirements.map((requirement) => (
            <div 
              key={requirement.id}
              className="flex items-center gap-2 text-sm"
            >
              {getRequirementIcon(requirement.met)}
              <span className={getRequirementTextColor(requirement.met)}>
                {requirement.label}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Additional Security Tips */}
      {strengthData.level === 'strong' && (
        <div className="flex items-center gap-2 text-xs text-green-400 bg-green-500/10 border border-green-500/30 rounded-md p-2">
          <CheckCircle className="h-4 w-4 flex-shrink-0" />
          <span>Excellent! Your password meets all security requirements.</span>
        </div>
      )}

      {strengthData.level === 'weak' && password.length > 0 && (
        <div className="flex items-center gap-2 text-xs text-yellow-400 bg-yellow-500/10 border border-yellow-500/30 rounded-md p-2">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>Keep adding requirements to strengthen your password.</span>
        </div>
      )}
    </div>
  )
}
