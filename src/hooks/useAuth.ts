import { useAppSelector, useAppDispatch } from '@/hooks/redux';
import { login, logout, sendSignupCode, verifySignupCode } from '@/stores/slices/auth.slice';
import {
  selectIsAuthenticated,
  selectCurrentUser,
  selectUserRole,
  selectAuthIsLoading,
  selectAuthError,
} from '@/stores/selectors/auth.selector';

export const useAuth = () => {
  const dispatch = useAppDispatch();

  const isAuthenticated = useAppSelector(selectIsAuthenticated);
  const currentUser = useAppSelector(selectCurrentUser);
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

  return {
    isAuthenticated,
    currentUser,
    userRole,
    isLoading,
    error,
    login: handleLogin,
    logout: handleLogout,
    sendSignupCode: handleSendSignupCode,
    verifySignupCode: handleVerifySignupCode,
  };
};