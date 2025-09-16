'use server';

import { signIn, signOut } from '@/lib/auth'; // <-- Correct import
import { z } from 'zod';

const loginSchema = z.object({
  email: z.string().email({ message: 'Please enter a valid email address.' }),
  password: z.string().min(1, { message: 'Password is required.' }),
});

export async function adminLoginWithPassword(
  previousState: { success: boolean; message?: string } | undefined,
  formData: FormData
) {
  const result = loginSchema.safeParse(Object.fromEntries(formData));

  if (!result.success) {
    return { success: false, message: result.error.errors[0].message };
  }

  const { email, password } = result.data;

  try {
    await signIn('credentials', { email, password, redirectTo: '/admin' });
    return { success: true, message: 'Login successful!' };
  } catch (error) {
    if ((error as Error).message.includes('CredentialsSignin')) {
      return { success: false, message: 'Invalid email or password.' };
    }
    console.error('Unhandled authentication error:', error);
    return { success: false, message: 'An unexpected error occurred.' };
  }
}

// --- ADD THIS NEW FUNCTION ---
export async function adminSignOut() {
  try {
    await signOut({ redirectTo: '/admin/login' });
  } catch (error) {
    console.error('Admin sign out error:', error);
    throw new Error('Failed to sign out');
  }
}