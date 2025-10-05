import { api } from '@/utils/axiosInstance';
import type { BackendCategory, AppCategory, CreateCategoryRequest, UpdateCategoryRequest } from '@/types/category.type';
import { mapBackendCategory } from '@/types/category.type';

function toFormData(payload: Record<string, any>): FormData {
  const fd = new FormData();
  Object.entries(payload).forEach(([k, v]) => {
    if (v === undefined || v === null) return;
    if (v instanceof Blob) {
      fd.append(k, v);
    } else {
      fd.append(k, String(v));
    }
  });
  return fd;
}

export async function getCategories(): Promise<AppCategory[]> {
  const list = await api.get<BackendCategory[]>('/categories');
  return list.map(mapBackendCategory);
}

export async function getCategoryById(id: string): Promise<AppCategory> {
  const data = await api.get<BackendCategory>(`/categories/${id}`);
  return mapBackendCategory(data);
}

export async function createCategory(payload: CreateCategoryRequest): Promise<AppCategory> {
  const fd = toFormData({
    name: payload.name,
    parentId: payload.parentId,
    isActive: payload.isActive,
    image: payload.image,
  });
  const data = await api.post<BackendCategory>('/categories', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapBackendCategory(data);
}

export async function updateCategory(id: string, payload: UpdateCategoryRequest): Promise<AppCategory> {
  const fd = toFormData({
    name: payload.name,
    parentId: payload.parentId,
    isActive: payload.isActive,
    image: payload.image,
  });
  const data = await api.put<BackendCategory>(`/categories/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return mapBackendCategory(data);
}

export async function deleteCategory(id: string): Promise<void> {
  await api.delete(`/categories/${id}`);
}
