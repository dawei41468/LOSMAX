import { useState, useEffect, useCallback } from 'react'; // Removed unused createContext
import { logout, refreshToken } from '../services/auth';
import type { ReactNode } from 'react';
import { WebSocketService } from '../services/websocket';
import { AuthContext } from './auth.context'; // Keep this for the actual context object
import type { AuthContextType } from './auth.types'; // Import the updated type

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserNameState] = useState<string | null>(localStorage.getItem('userName')); // Initialize from localStorage
  const [wsService, setWsService] = useState<WebSocketService | null>(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refresh_token');
        // Skip if token is empty
        if (storedRefreshToken && storedRefreshToken.trim() !== '') {
          await refreshToken(); // This might throw if refresh fails
          setIsAuthenticated(true);
          setUserNameState(localStorage.getItem('userName')); // Ensure userName is loaded after successful refresh
        } else {
          setIsAuthenticated(false);
          setUserNameState(null); // Clear userName if not authenticated
        }
      } catch (error) {
        console.error('Token validation or refresh failed:', error);
        setIsAuthenticated(false);
        setUserNameState(null); // Clear userName on auth failure
      }
    };

    // Validate tokens on mount.
    // isAuthenticated remains null (loading) until checkAuth completes.
    checkAuth();
  }, []);

  useEffect(() => {
    // Persist auth state to localStorage
    if (isAuthenticated !== null) {
      localStorage.setItem('isAuthenticated', isAuthenticated.toString());
    }
  }, [isAuthenticated]);

  useEffect(() => {
    // Initialize WebSocket service when auth state changes
    if (isAuthenticated && !wsService) {
      const service = new WebSocketService(setIsAuthenticated);
      // Get user ID from auth context or local storage
      const userId = localStorage.getItem('userId');
      if (!userId) {
        console.error('No user ID available for WebSocket connection');
        return;
      }
      service.connect(userId);
      setWsService(service);
    }

    return () => {
      wsService?.disconnect();
    };
  }, [isAuthenticated, wsService]);

  const setAuthState = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
  };

  const setUserNameContext = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
  }, []);

  const handleLogout = useCallback(async () => {
    await logout(setAuthState); // setAuthState will also trigger localStorage update for isAuthenticated
    localStorage.removeItem('userName'); // Explicitly remove userName
    setUserNameState(null);
    wsService?.disconnect();
    setWsService(null);
  }, [wsService]); // Removed setAuthState from deps as it's stable

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setAuthState,
      logout: handleLogout,
      userName,
      setUserNameContext
    } as AuthContextType}> {/* Explicitly cast to AuthContextType */}
      {children}
    </AuthContext.Provider>
  );
};