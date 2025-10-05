import { api } from '@/utils/axiosInstance';
import type {
  LoginRequest,
  LogoutRequest,
  SendSignupCodeRequest,
  VerifySignupCodeRequest,
  LoginResult,
  VoidResult,
} from '@/types/auth.type';

// POST auth/login
export const login = (payload: LoginRequest) =>
  api.post<LoginResult>('auth/login', payload);

// POST auth/logout
export const logout = (_payload?: LogoutRequest) =>
  api.post<VoidResult>('auth/logout');

// POST auth/send-signup-code
export const sendSignupCode = (payload: SendSignupCodeRequest) =>
  api.post<VoidResult>('auth/send-signup-code', payload);

// POST auth/verify-signup-code
export const verifySignupCode = (payload: VerifySignupCodeRequest) =>
  api.post<VoidResult>('auth/verify-signup-code', payload);
