import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next'; // Import useTranslation
import { logout, refreshToken } from '../services/auth';
import type { ReactNode } from 'react';
import { WebSocketService } from '../services/websocket';
import { AuthContext } from './auth.context'; // Keep this for the actual context object
import type { AuthContextType } from './auth.types'; // Import the updated type

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [userName, setUserNameState] = useState<string | null>(localStorage.getItem('userName'));
  const [userId, setUserIdState] = useState<string | null>(localStorage.getItem('userId'));
  const [userEmail, setUserEmailState] = useState<string | null>(localStorage.getItem('userEmail')); // Added userEmail state
  const [userRole, setUserRoleState] = useState<string | null>(localStorage.getItem('userRole')); // Added userRole state
  const [userLanguage, setUserLanguageState] = useState<string | null>(localStorage.getItem('userLanguage'));
  const [wsService, setWsService] = useState<WebSocketService | null>(null);
  const { i18n } = useTranslation(); // Get i18n instance

  // Apply initial language from localStorage as soon as provider mounts
  useEffect(() => {
    const storedLanguage = localStorage.getItem('userLanguage');
    if (storedLanguage && i18n.language !== storedLanguage) {
      i18n.changeLanguage(storedLanguage);
    }
  }, [i18n]); // Run once on mount

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const storedRefreshToken = localStorage.getItem('refresh_token');
        if (storedRefreshToken && storedRefreshToken.trim() !== '') {
          await refreshToken();
          setIsAuthenticated(true);
          const lsUserName = localStorage.getItem('userName');
          const lsUserId = localStorage.getItem('userId');
          const lsUserEmail = localStorage.getItem('userEmail'); // Get userEmail from localStorage
          const lsUserRole = localStorage.getItem('userRole'); // Get userRole from localStorage
          const lsUserLanguage = localStorage.getItem('userLanguage');
          setUserNameState(lsUserName);
          setUserIdState(lsUserId);
          setUserEmailState(lsUserEmail); // Set userEmail state
          setUserRoleState(lsUserRole); // Set userRole state
          setUserLanguageState(lsUserLanguage);
        } else {
          setIsAuthenticated(false);
          setUserNameState(null);
          setUserIdState(null);
          setUserEmailState(null); // Clear userEmail state
          setUserRoleState(null); // Clear userRole state
          setUserLanguageState(null);
        }
      } catch (error) {
        console.error('Token validation or refresh failed:', error);
        setIsAuthenticated(false);
        setUserNameState(null);
        setUserIdState(null);
        setUserEmailState(null); // Clear userEmail state
        setUserRoleState(null); // Clear userRole state
        setUserLanguageState(null);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (userLanguage && i18n.language !== userLanguage) {
      i18n.changeLanguage(userLanguage);
    }
  }, [userLanguage, i18n]);

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
      // Get user ID from auth context or local storage - now directly from state
      if (!userId) { // Check the state variable userId
        console.error('No user ID available for WebSocket connection');
        return;
      }
      // Pass userEmail to the connect method. userEmail is already available in this component's scope.
      service.connect(userId, userEmail);
      setWsService(service);
    }

    return () => {
      wsService?.disconnect();
    };
  }, [isAuthenticated, wsService, userId, userEmail]); // Added userId and userEmail to dependency array

  const setAuthState = (authenticated: boolean) => {
    setIsAuthenticated(authenticated);
    if (authenticated) {
      const lsUserLanguage = localStorage.getItem('userLanguage');
      setUserNameState(localStorage.getItem('userName'));
      setUserIdState(localStorage.getItem('userId'));
      setUserEmailState(localStorage.getItem('userEmail')); // Set userEmail from localStorage
      setUserRoleState(localStorage.getItem('userRole')); // Set userRole from localStorage
      setUserLanguageState(lsUserLanguage);
    } else {
      setUserNameState(null);
      setUserIdState(null);
      setUserEmailState(null); // Clear userEmail state
      setUserRoleState(null); // Clear userRole state
      setUserLanguageState(null);
    }
  };

  const setUserNameContext = useCallback((name: string) => {
    setUserNameState(name);
    localStorage.setItem('userName', name);
  }, []);

  const setUserLanguageContext = useCallback((language: string) => {
    setUserLanguageState(language);
    localStorage.setItem('userLanguage', language);
    i18n.changeLanguage(language);
  }, [i18n]);

  const handleLogout = useCallback(async () => {
    await logout(setAuthState);
    localStorage.removeItem('userName');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail'); // Remove userEmail from localStorage
    localStorage.removeItem('userRole'); // Remove userRole from localStorage
    localStorage.removeItem('userLanguage'); // Remove language on logout
    setUserNameState(null);
    setUserIdState(null);
    setUserEmailState(null); // Clear userEmail state
    setUserRoleState(null); // Clear userRole state
    setUserLanguageState(null); // Clear language state
    wsService?.disconnect();
    setWsService(null);
    const fallbackLng = Array.isArray(i18n.options.fallbackLng) ? i18n.options.fallbackLng[0] : i18n.options.fallbackLng;
    i18n.changeLanguage(typeof fallbackLng === 'string' ? fallbackLng : 'en'); // Revert to a valid fallback or 'en'
  }, [wsService, i18n]);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      setAuthState,
      logout: handleLogout,
      userName,
      setUserNameContext,
      userId,
      userEmail, // Provide userEmail in context
      userRole, // Provide userRole in context
      userLanguage,
      setUserLanguageContext
    } as AuthContextType}>
      {children}
    </AuthContext.Provider>
  );
};