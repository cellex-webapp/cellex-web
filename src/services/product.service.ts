import axiosInstance from "@/utils/axiosInstance";
import { isFormData } from '@/utils/formData';

export const productService = {
    getProductById: async (id: string): Promise<IApiResponse<IProduct>> => {
        const resp = await axiosInstance.get<IApiResponse<IProduct>>(`/products/${id}`);
        return (resp as unknown) as IApiResponse<IProduct>;
    },

    updateProduct: async (productId: string, data: any): Promise<IApiResponse<IProduct>> => {
        // If already FormData, send directly
        if (isFormData(data)) {
            const resp = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, data);
            return (resp as unknown) as IApiResponse<IProduct>;
        }

        // Detect if we need to send multipart (files present)
        const hasFiles = data && (
            (Array.isArray(data.images) && data.images.some((f: any) => typeof File !== 'undefined' && f instanceof File)) ||
            (data.image && typeof File !== 'undefined' && data.image instanceof File)
        );

        if (hasFiles) {
            const fd = new FormData();

            // Append simple fields
            if (data.categoryId !== undefined && data.categoryId !== null) fd.append('categoryId', String(data.categoryId));
            if (data.name !== undefined && data.name !== null) fd.append('name', String(data.name));
            if (data.description !== undefined && data.description !== null) fd.append('description', String(data.description));
            if (data.price !== undefined && data.price !== null) fd.append('price', String(data.price));
            if (data.saleOff !== undefined && data.saleOff !== null) fd.append('saleOff', String(data.saleOff));
            if (data.stockQuantity !== undefined && data.stockQuantity !== null) fd.append('stockQuantity', String(data.stockQuantity));
            if (data.isPublished !== undefined && data.isPublished !== null) fd.append('isPublished', String(data.isPublished));

            if (data.attributeValues !== undefined && data.attributeValues !== null) {
                try {
                    fd.append('attributeValues', JSON.stringify(data.attributeValues));
                } catch (e) {
                    // fallback
                    fd.append('attributeValues', String(data.attributeValues));
                }
            }

            // Append files in images array
            if (Array.isArray(data.images)) {
                for (const file of data.images) {
                    if (typeof File !== 'undefined' && file instanceof File) {
                        try {
                            fd.append('images', file, file.name || 'image');
                        } catch (e) {
                            fd.append('images', file as any);
                        }
                    }
                }
            }

            const resp = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, fd);
            return (resp as unknown) as IApiResponse<IProduct>;
        }

        const resp = await axiosInstance.put<IApiResponse<IProduct>>(`/products/${productId}`, data);
        return (resp as unknown) as IApiResponse<IProduct>;
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

        const hasFiles = data && Array.isArray(data.images) && data.images.some((f: any) => typeof File !== 'undefined' && f instanceof File);
        if (hasFiles) {
            const fd = new FormData();
            if (data.categoryId !== undefined && data.categoryId !== null) fd.append('categoryId', String(data.categoryId));
            if (data.name !== undefined && data.name !== null) fd.append('name', String(data.name));
            if (data.description !== undefined && data.description !== null) fd.append('description', String(data.description));
            if (data.price !== undefined && data.price !== null) fd.append('price', String(data.price));
            if (data.saleOff !== undefined && data.saleOff !== null) fd.append('saleOff', String(data.saleOff));
            if (data.stockQuantity !== undefined && data.stockQuantity !== null) fd.append('stockQuantity', String(data.stockQuantity));
            if (data.attributeValues !== undefined && data.attributeValues !== null) {
                try {
                    fd.append('attributeValues', JSON.stringify(data.attributeValues));
                } catch (e) {
                    fd.append('attributeValues', String(data.attributeValues));
                }
            }
            for (const file of data.images || []) {
                if (typeof File !== 'undefined' && file instanceof File) {
                    try {
                        fd.append('images', file, file.name || 'image');
                    } catch (e) {
                        fd.append('images', file as any);
                    }
                }
            }

            const resp = await axiosInstance.post<IApiResponse<IProduct>>('/products', fd);
            return (resp as unknown) as IApiResponse<IProduct>;
        }

        const resp = await axiosInstance.post<IApiResponse<IProduct>>('/products', data);
        return (resp as unknown) as IApiResponse<IProduct>;
    },
};

export default productService;
