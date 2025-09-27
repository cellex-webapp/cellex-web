import { createContext, useState } from 'react';
import { loginAPI, logoutAPI } from '../services/auth.service';

export default interface AuthContextType {
  accessToken: string | null;
  role: UserRole | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => Promise<void>;
}

interface AuthProviderProps {
  children: React.ReactNode;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [accessToken, setAccessToken] = useState<string | null>(localStorage.getItem('accessToken'));
  const [role, setRole] = useState<UserRole | null>(localStorage.getItem('role') as UserRole | null);
  const [loading, setLoading] = useState<boolean>(false);

  const login = async (credentials: LoginCredentials) => {
  setLoading(true);
  try {
    const result = await loginAPI(credentials);

    if (!result) {
      throw new Error("loginAPI returned null/undefined");
    }
    
    if (!result.access_token) {
      throw new Error("access_token not found in response");
    }
    
    setAccessToken(result.access_token);
    setRole(result.role as UserRole);
    
  } catch (error) {
    console.error("Login failed in context:", error);
    throw error;
  } finally {
    setLoading(false);
  }
};

  const logout = async () => {
    setLoading(true);
    try {
      await logoutAPI();
    } catch (error) {
      console.error("Logout failed in context:", error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('role');

      setAccessToken(null);
      setRole(null);
      setLoading(false);
    }
  };

  const value: AuthContextType = {
    accessToken,
    role,
    loading,
    isAuthenticated: !!accessToken,
    login,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};