import { useContext } from 'react';
import { AuthContext } from '../context/auth.context';
import type AuthContextType from '../context/auth.context';

export const useAuth = (): AuthContextType => {
  const context = useContext<AuthContextType | null>(AuthContext);

  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
};