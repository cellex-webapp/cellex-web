import axiosInstance from "@/utils/axiosInstance";

export const categoryService = {
  getAllCategories: () => axiosInstance.get('/categories'),
  getCategoryById: (id: string) => axiosInstance.get(`/categories/${id}`),
  createCategory: (data: ICreateCategoryPayload) =>
    axiosInstance.post('/categories', data),
  updateCategory: (payload: IUpdateCategoryPayload) => {
    const { id, ...data } = payload; 
    return axiosInstance.put(`/categories/${id}`, data);
  },
  deleteCategory: (id: string) => axiosInstance.delete(`/categories/${id}`),
}