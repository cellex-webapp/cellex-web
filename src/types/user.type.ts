export type AppRole = 'admin' | 'client' | 'vendor';

// User shape returned by backend
export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  avatar?: string | null;
  role: string; // e.g. 'USER' | 'ADMIN' | 'VENDOR'
  createdAt?: string;
  active?: boolean;
  provinceCode?: string | null;
  communeCode?: string | null;
  detailAddress?: string | null;
}

// Normalized user used in app state
export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string | null;
  avatar?: string | null;
  role: AppRole;
  provinceCode?: string | null;
  communeCode?: string | null;
  detailAddress?: string | null;
}

export function normalizeRole(raw?: string): AppRole {
  const r = (raw || '').toLowerCase();
  if (r === 'admin') return 'admin';
  if (r === 'vendor') return 'vendor';
  // treat 'user' or 'client' as client
  return 'client';
}

export function mapBackendUser(u: BackendUser): AppUser {
  return {
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    avatarUrl: u.avatarUrl ?? null,
    avatar: u.avatar ?? null,
    role: normalizeRole(u.role),
    provinceCode: u.provinceCode ?? null,
    communeCode: u.communeCode ?? null,
    detailAddress: u.detailAddress ?? null,
  };
}

// Requests/DTOs for user APIs
export interface UpdateProfileRequest {
  fullName: string;
  avatar?: string;
  provinceCode?: string;
  communeCode?: string;
  detailAddress?: string;
}

export interface CreateUserRequest {
  fullName: string;
  email: string;
  password: string;
  phoneNumber?: string;
  addresses?: string;
}

export interface UserSummary {
  id: string;
  email: string;
  fullName?: string;
  phoneNumber?: string | null;
  role: AppRole;
  avatarUrl?: string | null;
  active?: boolean;
  createdAt?: string;
  provinceCode?: string | null;
  communeCode?: string | null;
  detailAddress?: string | null;
}
