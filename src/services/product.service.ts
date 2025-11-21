import axiosInstance from "@/utils/axiosInstance";
import toFormData, { isFormData } from '@/utils/formData';

export const productService = {
  getAllProducts: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IProduct>>>('/products', { params });
    return response.data;
  },

  getProductById: async (id: string) => {
    const response = await axiosInstance.get<IApiResponse<IProduct>>(`/products/${id}`);
    return response.data;
  },

  getProductsByShop: async (shopId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IProduct>>>(`/products/shop/${shopId}`, { params });
    return response.data;
  },

  getProductsByCategory: async (categoryId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IProduct>>>(`/products/category/${categoryId}`, { params });
    return response.data;
  },

  searchProducts: async (keyword: string, params?: IPaginationParams) => {
    const queryParams = { keyword, ...params };
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IProduct>>>('/products/search', { params: queryParams });
    return response.data;
  },

  getMyProduct: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IProduct>>>('/products/my-products', { params });
    return response.data;
  },

  createProduct: async (data: ICreateProductPayload | FormData) => {
    const payload = isFormData(data) ? data : toFormData(data as Record<string, any>);
    const response = await axiosInstance.post<IApiResponse<IProduct>>('/products', payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  updateProduct: async (productId: string, data: IUpdateProductPayload | FormData) => {
    const payload = isFormData(data) ? data : toFormData(data as Record<string, any>);
    const response = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, payload, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  deleteProduct: async (productId: string) => {
    const response = await axiosInstance.delete<IApiResponse<string>>(`/products/${productId}`);
    return response.data;
  },
};

export default productService;