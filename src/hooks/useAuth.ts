import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { login, logout, sendSignupCode, verifySignupCode, fetchCurrentUser } from '@/stores/slices/auth.slice';
import {
  selectIsAuthenticated,
  selectCurrentShop,
  selectCurrentUser,
  selectUserRole,
  selectAuthIsLoading,
  selectAuthError,
} from '@/stores/selectors/auth.selector';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
  const currentShop = useAppSelector(selectCurrentShop);
  const userRole = useAppSelector(selectUserRole);
  const isLoading = useAppSelector(selectAuthIsLoading);
  const error = useAppSelector(selectAuthError);

  const handleLogin = (credentials: ILoginPayload) => {
    return dispatch(login(credentials));
  };

  const handleLogout = () => {
    return dispatch(logout());
  };

  const handleSendSignupCode = (data: ISendSignupCodePayload) => {
    return dispatch(sendSignupCode(data));
  };

  const handleVerifySignupCode = (data: IVerifySignupCodePayload) => {
    return dispatch(verifySignupCode(data));
  };

  const refreshUser = async () => {
    try {
      await dispatch(fetchCurrentUser()).unwrap();
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  return {
    isAuthenticated,
    currentUser,
    currentShop,
    userRole,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    sendSignupCode: handleSendSignupCode,
    verifySignupCode: handleVerifySignupCode,
    refreshUser,
  };
};