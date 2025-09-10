// Timer utilities for persistent email resend protection
export interface TimerState {
  email: string
  lastSentAt: number
  nextAllowedAt: number
  remainingSeconds: number
}

export class PersistentTimer {
  private static readonly STORAGE_KEY = 'email_resend_timer'
  private static readonly TIMER_DURATION = 3 * 60 * 1000 // 3 minutes in milliseconds

  // Save timer state to localStorage
  static saveTimerState(email: string): void {
    const now = Date.now()
    const nextAllowedAt = now + this.TIMER_DURATION
    
    const timerState: TimerState = {
      email: email.toLowerCase(),
      lastSentAt: now,
      nextAllowedAt: nextAllowedAt,
      remainingSeconds: Math.ceil(this.TIMER_DURATION / 1000)
    }

    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(timerState))
    } catch (error) {
      console.warn('Failed to save timer state to localStorage:', error)
    }
  }

  // Get timer state from localStorage
  static getTimerState(): TimerState | null {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      if (!stored) return null

      const timerState: TimerState = JSON.parse(stored)
      
      // Check if timer is still valid
      const now = Date.now()
      if (now >= timerState.nextAllowedAt) {
        // Timer has expired, clean up
        this.clearTimerState()
        return null
      }

      // Update remaining seconds
      timerState.remainingSeconds = Math.ceil((timerState.nextAllowedAt - now) / 1000)
      return timerState
    } catch (error) {
      console.warn('Failed to get timer state from localStorage:', error)
      return null
    }
  }

  // Check if email can be sent (no active timer)
  static canSendEmail(email: string): boolean {
    const timerState = this.getTimerState()
    if (!timerState) return true

    // Check if it's the same email
    if (timerState.email !== email.toLowerCase()) return true

    // Check if timer has expired
    const now = Date.now()
    return now >= timerState.nextAllowedAt
  }

  // Get remaining time for specific email
  static getRemainingTime(email: string): number {
    const timerState = this.getTimerState()
    if (!timerState) return 0

    // Check if it's the same email
    if (timerState.email !== email.toLowerCase()) return 0

    // Check if timer has expired
    const now = Date.now()
    if (now >= timerState.nextAllowedAt) {
      this.clearTimerState()
      return 0
    }

    return Math.ceil((timerState.nextAllowedAt - now) / 1000)
  }

  // Clear timer state
  static clearTimerState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY)
    } catch (error) {
      console.warn('Failed to clear timer state from localStorage:', error)
    }
  }

  // Format remaining time as MM:SS
  static formatTime(seconds: number): string {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  // Get timer progress percentage (0-100)
  static getProgressPercentage(remainingSeconds: number): number {
    const totalSeconds = this.TIMER_DURATION / 1000
    return Math.max(0, Math.min(100, ((totalSeconds - remainingSeconds) / totalSeconds) * 100))
  }
}

// Hook for managing persistent timer in React components
export function usePersistentTimer(email: string) {
  const [timerState, setTimerState] = React.useState<TimerState | null>(null)
  const [remainingSeconds, setRemainingSeconds] = React.useState(0)

  // Initialize timer state on mount
  React.useEffect(() => {
    const state = PersistentTimer.getTimerState()
    if (state && state.email === email.toLowerCase()) {
      setTimerState(state)
      setRemainingSeconds(state.remainingSeconds)
    }
  }, [email])

  // Update timer every second
  React.useEffect(() => {
    if (!timerState) return

    const interval = setInterval(() => {
      const remaining = PersistentTimer.getRemainingTime(email)
      setRemainingSeconds(remaining)

      if (remaining <= 0) {
        setTimerState(null)
        setRemainingSeconds(0)
        clearInterval(interval)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [timerState, email])

  // Start timer for email
  const startTimer = (email: string) => {
    PersistentTimer.saveTimerState(email)
    const state = PersistentTimer.getTimerState()
    if (state) {
      setTimerState(state)
      setRemainingSeconds(state.remainingSeconds)
    }
  }

  // Clear timer
  const clearTimer = () => {
    PersistentTimer.clearTimerState()
    setTimerState(null)
    setRemainingSeconds(0)
  }

  // Check if can send email
  const canSendEmail = () => {
    return PersistentTimer.canSendEmail(email)
  }

  return {
    timerState,
    remainingSeconds,
    canSendEmail: canSendEmail(),
    startTimer,
    clearTimer,
    formatTime: PersistentTimer.formatTime,
    getProgressPercentage: PersistentTimer.getProgressPercentage
  }
}

// Import React for the hook
import React from 'react'
