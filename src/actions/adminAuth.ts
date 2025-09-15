'use server'

import { redirect } from 'next/navigation'

export async function authenticateAdmin(
  previousState: string | undefined, 
  formData: FormData
) {
  const email = formData.get('email') as string
  const password = formData.get('password') as string

  try {
    // Call the admin authentication API directly
    const response = await fetch(`${process.env.NEXTAUTH_URL}/api/auth/admin/callback/credentials`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        email,
        password,
        redirect: 'false',
        callbackUrl: '/admin'
      })
    })

    if (!response.ok) {
      return 'Invalid credentials. Please check your email and password.'
    }

    // If successful, redirect to admin dashboard
    redirect('/admin')
  } catch (error) {
    console.error('Admin authentication error:', error)
    return 'An error occurred during authentication. Please try again.'
  }
}