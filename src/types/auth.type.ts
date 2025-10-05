// Auth request/response types
export interface LoginRequest {
  email: string;
  password: string;
}

export interface LogoutRequest {}

export interface SendSignupCodeRequest {
  email: string;
  fullName: string;
  phoneNumber: string;
  password: string;
  confirmPassword: string;
}

export interface VerifySignupCodeRequest {
  email: string;
  otp: string;
}

// Common response payloads
export interface LoginResult {
  access_token?: string;
  refresh_token?: string;
  user?: import('./user.type').BackendUser;
}

// When API returns no result value on success, we use void
export type VoidResult = void;
