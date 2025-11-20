import axiosInstance from "@/utils/axiosInstance";

export const cartService = {
  getMyCart: async () => {
    const response = await axiosInstance.get<IApiResponse<ICart>>('/carts/my-cart');
    return response.data;
  },

  addToCart: async (payload: IAddToCartRequest) => {
    const response = await axiosInstance.post<IApiResponse<ICart>>('/carts/add', payload);
    return response.data;
  },

  updateQuantity: async (payload: IUpdateCartItemQuantityRequest) => {
    const response = await axiosInstance.patch<IApiResponse<ICart>>('/carts/update-quantity', payload);
    return response.data;
  },

  setQuantity: async (payload: ISetCartItemQuantityRequest) => {
    const response = await axiosInstance.patch<IApiResponse<ICart>>('/carts/set-quantity', payload);
    return response.data;
  },

  removeFromCart: async (payload: IRemoveFromCartRequest) => {
    const response = await axiosInstance.delete<IApiResponse<ICart>>('/carts/remove', { data: payload });
    return response.data;
  },

  clearCart: async () => {
    const response = await axiosInstance.delete<IApiResponse<ICart>>('/carts/clear');
    return response.data;
  },

  getAllCarts: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<ICart>>>('/carts', { params });
    return response.data;
  },

  getCartById: async (cartId: string) => {
    const response = await axiosInstance.get<IApiResponse<ICart>>(`/carts/${cartId}`);
    return response.data;
  },
};