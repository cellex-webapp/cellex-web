import { useCallback, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '@/stores/RootReducer';
import { getItem, removeItem, setItem } from '../utils/localStorage';
import { login as loginAction } from '../stores/slices/authSlice';

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
  const isAuthenticated = isAuthFromStore || (hasToken && hasUser);

  if (!isAuthenticated) {
    removeItem('user');
  }

  const login = useCallback(async ({
    email,
    _password,
  }: {
    email: string;
    _password: string;
  }) => {
    void _password; // placeholder until real API is wired
    // TODO: replace with real API call
    const role = email.toLowerCase().includes('admin')
      ? 'admin'
      : email.toLowerCase().includes('vendor')
        ? 'vendor'
        : 'client';
    const fakeToken = 'demo-token-' + Date.now();
    const newUser = { id: 'u1', email, role } as const;
    setItem('access_token', fakeToken);
    setItem('user', JSON.stringify(newUser));
    dispatch(
      loginAction({ token: fakeToken, user: { ...newUser } as any }),
    );
    return { token: fakeToken, user: newUser };
  }, [dispatch]);

  return {
    isAuthenticated,
    user: user ?? storedUser,
    token: accessToken as string | null,
    hasToken,
    hasUser,
    login,
  } as const;
};
