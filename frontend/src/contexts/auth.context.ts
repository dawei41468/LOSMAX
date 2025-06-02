import { createContext } from 'react';
import type { AuthContextType } from './auth.types';

// Update to match new type with loading state
export const AuthContext = createContext<AuthContextType>({
  isAuthenticated: null,
  setAuthState: () => {},
  logout: async () => {},
  userName: null, // Add default for userName
  setUserNameContext: () => {} // Add default for setUserNameContext
});