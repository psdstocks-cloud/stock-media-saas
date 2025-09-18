import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Brand color utilities
export const brandColors = {
  primary: "hsl(275 100% 25%)", // Dark Purple
  secondary: "hsl(24 100% 50%)", // Vibrant Orange
  primaryDark: "hsl(275 100% 45%)", // Lighter Purple (dark mode)
  secondaryDark: "hsl(24 100% 60%)", // Lighter Orange (dark mode)
} as const

// Design system tokens
export const designTokens = {
  spacing: {
    xs: "0.25rem", // 4px
    sm: "0.5rem",  // 8px
    md: "1rem",    // 16px
    lg: "1.5rem",  // 24px
    xl: "2rem",    // 32px
    "2xl": "3rem", // 48px
    "3xl": "4rem", // 64px
  },
  borderRadius: {
    sm: "0.25rem", // 4px
    md: "0.5rem",  // 8px
    lg: "0.75rem", // 12px
    xl: "1rem",    // 16px
    full: "9999px",
  },
  shadows: {
    sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
    md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
    lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
    xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
    brand: "0 10px 15px -3px hsl(275 100% 25% / 0.25), 0 4px 6px -4px hsl(275 100% 25% / 0.25)",
  },
} as const

// Typography utilities
export const typography = {
  heading: {
    h1: "text-4xl font-bold tracking-tight",
    h2: "text-3xl font-semibold tracking-tight",
    h3: "text-2xl font-semibold tracking-tight",
    h4: "text-xl font-semibold tracking-tight",
    h5: "text-lg font-semibold tracking-tight",
    h6: "text-base font-semibold tracking-tight",
  },
  body: {
    large: "text-lg leading-7",
    base: "text-base leading-6",
    small: "text-sm leading-5",
    xs: "text-xs leading-4",
  },
} as const
