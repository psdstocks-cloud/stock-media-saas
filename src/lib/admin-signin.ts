// Custom admin sign-in function that uses the admin NextAuth configuration
export async function adminSignIn(credentials: { email: string; password: string }) {
  const response = await fetch('/api/auth/admin/signin', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Authentication failed');
  }

  return response.json();
}
