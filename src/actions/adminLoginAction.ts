'use server';

// CRITICAL: Import signIn from our dedicated admin auth file
import { signIn } from '@/lib/auth/adminAuth';
import { prisma } from '@/lib/prisma';

export async function adminLoginAction(
  previousState: string | undefined,
  formData: FormData
) {
  const email = formData.get('email') as string;

  if (!email) {
    return { success: false, message: 'Email is required.' };
  }

  try {
    // First, verify this email belongs to an admin
    const adminUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!adminUser || (adminUser.role !== 'ADMIN' && adminUser.role !== 'SUPER_ADMIN')) {
      // Security: Log the attempt but return a generic success message
      // to prevent email enumeration attacks.
      console.log(`Non-admin email attempted login: ${email}`);
      return { success: true, message: 'If this email is registered, a magic link has been sent.' };
    }

    // This now calls the correct, defined signIn function
    await signIn('email', { email, redirect: false });
    
    return { success: true, message: 'A magic link has been sent to your email.' };

  } catch (error) {
    console.error('Failed to send admin magic link:', { email, error, timestamp: new Date().toISOString() });
    return { success: false, message: 'An unexpected error occurred. Please try again.' };
  }
}
