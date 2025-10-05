import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/stores/RootReducer';
import { getItem, removeItem } from '../utils/localStorage';
import { loginThunk, logout as logoutAction, logoutThunk } from '../stores/slices/authSlice';
import type { LoginRequest } from '@/types/auth.type';

export const useAuth = () => {
  const dispatch = useDispatch();
  const {
    user,
    token,
    isAuthenticated: isAuthFromStore,
  } = useSelector((state: RootState) => state.auth);

  const accessToken = token ?? getItem('access_token');
  const storedUser = useMemo(() => {
    const str = getItem('user');
    try {
      return str ? JSON.parse(str) : null;
    } catch {
      return null;
    }
  }, []);

  const hasToken = Boolean(accessToken);
  const hasUser = Boolean(user || storedUser);
  const isAuthenticated = isAuthFromStore || hasToken;

  if (!isAuthenticated) {
    removeItem('user');
  }

  const login = useCallback(async ({ email, password }: LoginRequest) => {
    const action = await dispatch(loginThunk({ email, password }) as any);
    if (action.meta.requestStatus === 'fulfilled') {
      const payload = action.payload as any;
      // return token and mapped user as stored in slice/localStorage
      const token = payload?.access_token ?? payload?.token ?? null;
      const stored = getItem('user');
      let userObj: any = null;
      try { userObj = stored ? JSON.parse(stored) : null; } catch {}
      return { token, user: userObj };
    }
    throw new Error((action.payload as string) || 'Login failed');
  }, [dispatch]);

  const logout = useCallback(async () => {
    try {
      await dispatch(logoutThunk() as any);
    } finally {
      dispatch(logoutAction());
    }
  }, [dispatch]);

  return {
    isAuthenticated,
    user: user ?? storedUser,
    token: accessToken as string | null,
    hasToken,
    hasUser,
    login,
    logout,
  } as const;
};
