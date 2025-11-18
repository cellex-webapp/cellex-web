import axiosInstance from "@/utils/axiosInstance";
import toFormData from '@/utils/formData';

export const categoryService = {
  getAllCategories: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<ICategory>>>('/categories', {
      params,
    });
    return response.data; 
  },

  getCategoryById: async (id: string) => {
    const response = await axiosInstance.get<IApiResponse<ICategory>>(`/categories/${id}`);
    return response.data;
  },

  getCategoryBySlug: async (slug: string) => {
    const response = await axiosInstance.get<IApiResponse<ICategory>>(`/categories/slug/${slug}`);
    return response.data;
  },

  createCategory: async (data: ICreateCategoryPayload) => {
    const fd = toFormData({
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive,
      image: data.image,
    });

    const response = await axiosInstance.post<IApiResponse<ICategory>>('/categories', fd);
    return response.data;
  },

  updateCategory: async (payload: IUpdateCategoryPayload) => {
    const { id, ...data } = payload;
    
    const fd = toFormData({
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive,
      image: data.image,
    });

    const response = await axiosInstance.put<IApiResponse<ICategory>>(`/categories/${id}`, fd);
    return response.data;
  },

  deleteCategory: async (id: string) => {
    const response = await axiosInstance.delete<IApiResponse<null>>(`/categories/${id}`);
    return response.data;
  },
};