import axiosInstance from "@/utils/axiosInstance";
import toFormData, { isFormData } from '@/utils/formData';

export const productService = {
    getAllProducts: async (params?: { page?: number; limit?: number; sortType?: string; sortBy?: string }): Promise<IApiResponse<IPage<IProduct>>> => {
        const resp = await axiosInstance.get<IApiResponse<IPage<IProduct>>>('/products', { params });
        return (resp as unknown) as IApiResponse<IPage<IProduct>>;
    },
    getProductById: async (id: string): Promise<IApiResponse<IProduct>> => {
        const resp = await axiosInstance.get<IApiResponse<IProduct>>(`/products/${id}`);
        return (resp as unknown) as IApiResponse<IProduct>;
    },

    updateProduct: async (productId: string, data: any): Promise<IApiResponse<IProduct>> => {
        if (isFormData(data)) {
            const resp = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, data);
            return (resp as unknown) as IApiResponse<IProduct>;
        }

        const fd = toFormData(data);

        const resp = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, fd);
        return (resp as unknown) as IApiResponse<IProduct>;
    },

    deleteProduct: async (productId: string): Promise<IApiResponse<string>> => {
        const resp = await axiosInstance.delete<IApiResponse<string>>(`/products/${productId}`);
        return (resp as unknown) as IApiResponse<string>;
    },

    getProductsByShop: async (shopId: string, pageable?: IPageable): Promise<IApiResponse<IPage<IProduct>>> => {
        const resp = await axiosInstance.get<IApiResponse<IPage<IProduct>>>(`/products/shop/${shopId}`, { params: pageable });
        return (resp as unknown) as IApiResponse<IPage<IProduct>>;
    },

    searchProducts: async (keyword: string, pageable?: IPageable): Promise<IApiResponse<IPage<IProduct>>> => {
        const resp = await axiosInstance.get<IApiResponse<IPage<IProduct>>>('/products/search', { params: { keyword, ...(pageable || {}) } });
        return (resp as unknown) as IApiResponse<IPage<IProduct>>;
    },

    getProductsByCategory: async (categoryId: string, pageable?: IPageable): Promise<IApiResponse<IPage<IProduct>>> => {
        const resp = await axiosInstance.get<IApiResponse<IPage<IProduct>>>(`/products/category/${categoryId}`, { params: pageable });
        return (resp as unknown) as IApiResponse<IPage<IProduct>>;
    },

    createProduct: async (data: any): Promise<IApiResponse<IProduct>> => {
        if (isFormData(data)) {
            const resp = await axiosInstance.post<IApiResponse<IProduct>>('/products', data);
            return (resp as unknown) as IApiResponse<IProduct>;
        }

        const fd = toFormData(data);

        const resp = await axiosInstance.post<IApiResponse<IProduct>>('/products', fd);
        return (resp as unknown) as IApiResponse<IProduct>;
    },

    getMyProduct: async (pageable?: IPageable): Promise<IApiResponse<IPage<IProduct>>> => {
        const resp = await axiosInstance.get<IApiResponse<IPage<IProduct>>>('/products/my-products', { params: pageable });
        return (resp as unknown) as IApiResponse<IPage<IProduct>>;
    }
};

export default productService;