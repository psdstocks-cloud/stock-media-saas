'use server';

// CRITICAL: Import signIn from our dedicated admin auth file
import { signIn } from '@/lib/auth/adminAuth';
import { prisma } from '@/lib/prisma';

export async function adminLoginAction(
  previousState: { success: boolean; message: string } | undefined,
  formData: FormData
): Promise<{ success: boolean; message: string }> {
  // --- PRE-FLIGHT ENVIRONMENT VALIDATION ---
  console.log('🔍 Admin Login Action - Environment Check:', {
    hasNEXTAUTH_SECRET: !!process.env.NEXTAUTH_SECRET,
    hasRESEND_API_KEY: !!process.env.RESEND_API_KEY,
    hasEMAIL_FROM: !!process.env.EMAIL_FROM,
    hasDATABASE_URL: !!process.env.DATABASE_URL,
    NEXTAUTH_URL: process.env.NEXTAUTH_URL,
    timestamp: new Date().toISOString()
  });

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
    console.log('🔍 Attempting to call signIn with email provider...', { email });
    
    try {
      await signIn('email', { email, redirect: false });
      console.log('✅ signIn call completed successfully');
    } catch (signInError) {
      console.error('🚨 signIn call failed specifically:', signInError);
      throw signInError; // Re-throw to be caught by outer catch block
    }
    
    return { success: true, message: 'A magic link has been sent to your email.' };

  } catch (error) {
    // --- START OF ENHANCED CATCH BLOCK ---
    console.error('CRITICAL: The signIn("email") process failed. Full error:', error);
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      email,
      timestamp: new Date().toISOString()
    });

    if (error instanceof Error) {
      // Check for common failure reasons
      if (error.message.toLowerCase().includes('email')) {
        return { success: false, message: 'Could not send sign-in email. Please check email provider configuration.' };
      }
      if (error.message.toLowerCase().includes('database')) {
        return { success: false, message: 'A database error occurred. Please try again.' };
      }
      if (error.message.toLowerCase().includes('resend')) {
        return { success: false, message: 'Email service configuration error. Please check RESEND_API_KEY.' };
      }
      if (error.message.toLowerCase().includes('verification')) {
        return { success: false, message: 'Token generation failed. Please try again.' };
      }
      if (error.message.toLowerCase().includes('nextauth')) {
        return { success: false, message: 'Authentication service error. Please check NEXTAUTH_SECRET.' };
      }
    }
    
    // Generic fallback with more context
    return { success: false, message: 'An unexpected server error occurred. See logs for details.' };
    // --- END OF ENHANCED CATCH BLOCK ---
  }
}
