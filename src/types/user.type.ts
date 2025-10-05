export type AppRole = 'admin' | 'client' | 'vendor';

// User shape returned by backend
export interface BackendUser {
  id: string;
  fullName: string;
  email: string;
  phoneNumber?: string | null;
  avatarUrl?: string | null;
  role: string; // e.g. 'USER' | 'ADMIN' | 'VENDOR'
  createdAt?: string;
  active?: boolean;
}

// Normalized user used in app state
export interface AppUser {
  id: string;
  email: string;
  fullName?: string;
  avatarUrl?: string | null;
  role: AppRole;
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
    role: normalizeRole(u.role),
  };
}
