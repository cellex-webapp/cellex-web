import { api } from '@/utils/axiosInstance';
import type { AppUser, BackendUser, CreateUserRequest, UpdateProfileRequest, UserSummary } from '@/types/user.type';
import { mapBackendUser } from '@/types/user.type';

// GET /users - list all users
export async function getUsers(): Promise<UserSummary[]> {
  const list = await api.get<BackendUser[]>('/users');
  return list.map(u => ({
    id: u.id,
    email: u.email,
    fullName: u.fullName,
    phoneNumber: u.phoneNumber ?? undefined,
    role: mapBackendUser(u).role,
    avatarUrl: u.avatarUrl ?? undefined,
    active: u.active,
    createdAt: u.createdAt,
    provinceCode: u.provinceCode ?? undefined,
    communeCode: u.communeCode ?? undefined,
    detailAddress: u.detailAddress ?? undefined,
  }));
}

// GET /users/{userId}
export async function getUserById(userId: string): Promise<AppUser> {
  const u = await api.get<BackendUser>(`/users/${userId}`);
  return mapBackendUser(u);
}

// GET /users/me
export async function getCurrentUser(): Promise<AppUser> {
  const u = await api.get<BackendUser>('/users/me');
  return mapBackendUser(u);
}

// POST /users/add-account
export async function addAccount(payload: CreateUserRequest): Promise<AppUser> {
  const u = await api.post<BackendUser>('/users/add-account', payload);
  return mapBackendUser(u);
}

// PUT /users/profile
export async function updateProfile(payload: UpdateProfileRequest): Promise<AppUser> {
  const u = await api.put<BackendUser>('/users/profile', payload);
  return mapBackendUser(u);
}

// PUT /users/{userId} - admin updates a user by id
export async function updateUserByAdmin(userId: string, payload: UpdateProfileRequest): Promise<AppUser> {
  const u = await api.put<BackendUser>(`/users/${userId}`, payload);
  return mapBackendUser(u);
}
