import axiosInstance from "@/utils/axiosInstance";

export const categoryService = {
  getAllCategories: async (): Promise<IApiResponse<ICategory[]>> => {
    const resp = await axiosInstance.get<IApiResponse<ICategory[]>>('/categories');
    return (resp as unknown) as IApiResponse<ICategory[]>;
  },
  getCategoryById: async (id: string): Promise<IApiResponse<ICategory>> => {
    const resp = await axiosInstance.get<IApiResponse<ICategory>>(`/categories/${id}`);
    return (resp as unknown) as IApiResponse<ICategory>;
  },
  createCategory: async (data: ICreateCategoryPayload | FormData | any): Promise<IApiResponse<ICategory>> => {
    // if caller already passed FormData, use it directly
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      return (resp as unknown) as IApiResponse<ICategory>;
    }

  // If image is a File or parentId is present, send multipart/form-data
  const shouldUseForm = data && (data.image instanceof File || data.parentId !== undefined);
    if (shouldUseForm) {
      const fd = new FormData();
      if (data.name !== undefined) fd.append('name', data.name);
      if (data.description !== undefined) fd.append('description', data.description);
      if (data.parentId !== undefined) fd.append('parentId', data.parentId);
  // do not include isActive (not part of create payload per current API)
      if (data.image instanceof File) fd.append('image', data.image);

      const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return (resp as unknown) as IApiResponse<ICategory>;
    }

    const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', data);
    return (resp as unknown) as IApiResponse<ICategory>;
  },
  updateCategory: async (payload: IUpdateCategoryPayload): Promise<IApiResponse<ICategory>> => {
    const { id, ...data } = payload;
  // if image is a File or parentId provided, send multipart
  const shouldUseForm = data && (data.image instanceof File || data.parentId !== undefined);
    if (shouldUseForm) {
      const fd = new FormData();
      if (data.name !== undefined) fd.append('name', data.name);
      if (data.description !== undefined) fd.append('description', data.description);
      if (data.parentId !== undefined) fd.append('parentId', data.parentId);
  // do not include isActive (not part of update payload per current API)
      if (data.image instanceof File) fd.append('image', data.image);

      const resp = await axiosInstance.put<IApiResponse<ICategory>>(`/categories/${id}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      return (resp as unknown) as IApiResponse<ICategory>;
    }

    const resp = await axiosInstance.put<IApiResponse<ICategory>>(`/categories/${id}`, data);
    return (resp as unknown) as IApiResponse<ICategory>;
  },
  deleteCategory: async (id: string): Promise<IApiResponse<null>> => {
    const resp = await axiosInstance.delete<IApiResponse<null>>(`/categories/${id}`);
    return (resp as unknown) as IApiResponse<null>;
  },
};