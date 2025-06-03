export type AuthContextType = {
  isAuthenticated: boolean | null;  // null = loading
  setAuthState: (authenticated: boolean) => void;
  logout: () => Promise<void>;
  userName: string | null;
  setUserNameContext: (name: string) => void;
  userId: string | null; // This now correctly represents the MongoDB user ID
  userEmail: string | null; // Added to store the user's email
  userRole: string | null; // Added to store the user's role
  userLanguage: string | null;
  setUserLanguageContext: (language: string) => void;
};