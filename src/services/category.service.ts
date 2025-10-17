import axiosInstance from "@/utils/axiosInstance";

export const categoryService = {
  getAllCategories: () => axiosInstance.get('/categories'),
  getCategoryById: (id: string) => axiosInstance.get(`/categories/${id}`),
  createCategory: (data: ICreateCategoryPayload | FormData | any) => {
    if (typeof FormData !== 'undefined' && data instanceof FormData) {
      return axiosInstance.post('/categories', data, { headers: { 'Content-Type': 'multipart/form-data' } });
    }

    return axiosInstance.post('/categories', data);
  },
  updateCategory: (payload: IUpdateCategoryPayload) => {
    const { id, ...data } = payload; 
    return axiosInstance.put(`/categories/${id}`, data);
  },
  deleteCategory: (id: string) => axiosInstance.delete(`/categories/${id}`),
}