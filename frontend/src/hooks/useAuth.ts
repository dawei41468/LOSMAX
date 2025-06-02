import { useContext } from 'react';
import { AuthContext } from '../contexts/auth.context';
import type { AuthContextType } from '../contexts/auth.types';

export const useAuth = (): AuthContextType => useContext(AuthContext);