import axiosInstance from "@/utils/axiosInstance";
import toFormData from '@/utils/formData';

export const categoryService = {
  getAllCategories: async (): Promise<IApiResponse<ICategory[]>> => {
    const resp = await axiosInstance.get<IApiResponse<ICategory[]>>('/categories');
    return (resp as unknown) as IApiResponse<ICategory[]>;
  },

  getCategoryById: async (id: string): Promise<IApiResponse<ICategory>> => {
    const resp = await axiosInstance.get<IApiResponse<ICategory>>(`/categories/${id}`);
    return (resp as unknown) as IApiResponse<ICategory>;
  },

  getCategoryBySlug: async (slug: string): Promise<IApiResponse<ICategory>> => {
    const resp = await axiosInstance.get<IApiResponse<ICategory>>(`/categories/slug/${slug}`);
    return (resp as unknown) as IApiResponse<ICategory>;
  },

  createCategory: async (data: ICreateCategoryPayload): Promise<IApiResponse<ICategory>> => {
    const fd = toFormData({
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive,
      image: data.image,
    });

    const resp = await axiosInstance.post<IApiResponse<ICategory>>('/categories', fd);
    return (resp as unknown) as IApiResponse<ICategory>;
  },

  updateCategory: async (payload: IUpdateCategoryPayload): Promise<IApiResponse<ICategory>> => {
    const { id, ...data } = payload;

    const fd = toFormData({
      name: data.name,
      description: data.description,
      parentId: data.parentId,
      isActive: data.isActive,
      image: data.image,
    });

    const resp = await axiosInstance.put<IApiResponse<ICategory>>(`/categories/${id}`, fd);
    return (resp as unknown) as IApiResponse<ICategory>;
  },

  deleteCategory: async (id: string): Promise<IApiResponse<null>> => {
    const resp = await axiosInstance.delete<IApiResponse<null>>(`/categories/${id}`);
    return (resp as unknown) as IApiResponse<null>;
  },
};