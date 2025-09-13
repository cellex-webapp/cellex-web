import type { IFetchUser, UserRole } from "../types/user";

const STORAGE_KEY = "mock_user";

export async function fetchAccountAPI(): Promise<IFetchUser | null> {
  // Simulate async fetch
  await new Promise((r) => setTimeout(r, 200));
  const raw = localStorage.getItem(STORAGE_KEY);
  if (!raw) return null;
  try {
    const user: IFetchUser = JSON.parse(raw);
    return user?.userId ? user : null;
  } catch {
    return null;
  }
}

export async function signUp(role: UserRole, username?: string): Promise<IFetchUser> {
  await new Promise((r) => setTimeout(r, 200));
  const user: IFetchUser = {
    userId: crypto.randomUUID(),
    username: username || role,
    role,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function loginAPI(role: UserRole, username?: string): Promise<IFetchUser> {
  await new Promise((r) => setTimeout(r, 200));
  const user: IFetchUser = {
    userId: crypto.randomUUID(),
    username: username || role,
    role,
  };
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
  return user;
}

export async function logoutAPI(): Promise<void> {
  await new Promise((r) => setTimeout(r, 100));
  localStorage.removeItem(STORAGE_KEY);
}
