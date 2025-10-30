import axiosInstance from "@/utils/axiosInstance";
import toFormData, { isFormData } from '@/utils/formData';

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
    if (isFormData(data)) {
      const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', data);
      return (resp as unknown) as IApiResponse<ICategory>;
    }

    const shouldUseForm = data && ((data.image && typeof File !== 'undefined' && data.image instanceof File) || data.parentId !== undefined);
    if (shouldUseForm) {
      const fd = toFormData({
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        image: data.image,
      });

      const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', fd);
      return (resp as unknown) as IApiResponse<ICategory>;
    }

    const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', data);
    return (resp as unknown) as IApiResponse<ICategory>;
  },
  updateCategory: async (payload: IUpdateCategoryPayload): Promise<IApiResponse<ICategory>> => {
    const { id, ...data } = payload;
    const shouldUseForm = data && ((data.image && typeof File !== 'undefined' && data.image instanceof File) || data.parentId !== undefined);
    if (shouldUseForm) {
      const fd = toFormData({
        name: data.name,
        description: data.description,
        parentId: data.parentId,
        image: data.image,
      });

      const resp = await axiosInstance.put<IApiResponse<ICategory>>(`/categories/${id}`, fd);
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