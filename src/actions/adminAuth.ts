'use server'

import { redirect } from 'next/navigation'
import { signIn } from '@/lib/auth/adminAuth'

export async function authenticateAdmin(
  previousState: string | undefined, 
  formData: FormData
) {
  try {
    // Use the admin-specific signIn function
    await signIn('admin-credentials', formData)
    // On success, NextAuth will handle the redirect
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'Invalid credentials. Please check your email and password.'
    }
    // For any other error (like the 500 you were seeing)
    console.error('Unhandled authentication error:', error)
    return 'An unexpected error occurred. Please try again.'
  }
}