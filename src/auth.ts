// Minimal auth file to prevent build errors
// This is a placeholder - implement proper authentication as needed

export const auth = async () => {
  return {
    user: {
      id: 'placeholder',
      email: 'placeholder@example.com',
      name: 'Placeholder User',
      role: 'ADMIN'
    }
  } as any
}

export const signIn = async () => {
  return { error: 'Authentication not implemented' }
}

export const signOut = async () => {
  return { error: 'Authentication not implemented' }
}

export const handlers = {
  GET: () => new Response('Not implemented'),
  POST: () => new Response('Not implemented')
}

export const GET = handlers.GET
export const POST = handlers.POST
