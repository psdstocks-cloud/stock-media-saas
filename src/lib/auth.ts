// Import the user auth configuration
import { GET, POST, auth, signIn, signOut } from './auth/userAuth'
import { userAuthOptions } from './auth/userAuthOptions'

// Re-export for the main auth route
export { GET, POST, auth, signIn, signOut, userAuthOptions as authOptions }