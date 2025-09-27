'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface SwitchProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'onChange'> {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  disabled?: boolean
}

export const Switch = React.forwardRef<HTMLButtonElement, SwitchProps>(
  ({ checked = false, onCheckedChange, disabled = false, className, ...props }, ref) => {
    function handleClick() {
      if (disabled) return
      onCheckedChange?.(!checked)
    }

    return (
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-disabled={disabled || undefined}
        data-state={checked ? 'checked' : 'unchecked'}
        onClick={handleClick}
        ref={ref}
        className={cn(
          'relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
          checked ? 'bg-primary' : 'bg-muted',
          className
        )}
        {...props}
      >
        <span
          className={cn(
            'inline-block h-5 w-5 transform rounded-full bg-background shadow transition-transform',
            checked ? 'translate-x-5' : 'translate-x-1'
          )}
          aria-hidden="true"
        />
      </button>
    )
  }
)
Switch.displayName = 'Switch'
