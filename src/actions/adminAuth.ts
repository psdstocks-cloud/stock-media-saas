'use server'

// CRITICAL: Import the dedicated signIn function from your admin auth file
import { signIn } from '@/lib/auth/adminAuth'

export async function authenticateAdmin(
  previousState: string | undefined, 
  formData: FormData
) {
  try {
    // This is the correct way to sign in.
    // NextAuth handles the cookie and redirect automatically.
    await signIn('admin-credentials', formData)
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return 'Invalid credentials. Please check your email and password.'
    }
    // This will catch other errors (like network issues)
    return 'An error occurred during authentication. Please try again.'
  }
}