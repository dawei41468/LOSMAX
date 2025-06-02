export type AuthContextType = {
  isAuthenticated: boolean | null;  // null = loading
  setAuthState: (authenticated: boolean) => void;
  logout: () => Promise<void>;
  userName: string | null;
  setUserNameContext: (name: string) => void;
};