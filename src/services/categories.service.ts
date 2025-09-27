import instance from "./axios-instance";

export async function fetchCategoriesAPI(): Promise<ICategory[]> {
  const response = await instance.get<ICategory[]>("/categories");
  return response.data;
}

export async function fetchCategoryByIdAPI(id: string): Promise<ICategory> {
  const response = await instance.get<ICategory>(`/categories/${id}`);
  return response.data;
}

export async function createCategoryAPI(category: Partial<ICategory>): Promise<ICategory> {
  const response = await instance.post<ICategory>("/categories", category);
  return response.data;
}

export async function updateCategoryAPI(id: string, category: Partial<ICategory>): Promise<ICategory> {
  const response = await instance.put<ICategory>(`/categories/${id}`, category);
  return response.data;
}

export async function deleteCategoryAPI(id: string): Promise<void> {
  await instance.delete<void>(`/categories/${id}`);
}