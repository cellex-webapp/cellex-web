import axiosInstance from "@/utils/axiosInstance";

export const cartService = {
  getMyCart: async (): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.get<IApiResponse<ICart>>('/carts/my-cart');
    return (resp as unknown) as IApiResponse<ICart>;
  },

  addToCart: async (payload: IAddToCartRequest): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.post<IApiResponse<ICart>>('/carts/add', payload);
    return (resp as unknown) as IApiResponse<ICart>;
  },

  updateQuantity: async (payload: IUpdateCartItemQuantityRequest): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.patch<IApiResponse<ICart>>('/carts/update-quantity', payload);
    return (resp as unknown) as IApiResponse<ICart>;
  },

  setQuantity: async (payload: ISetCartItemQuantityRequest): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.patch<IApiResponse<ICart>>('/carts/set-quantity', payload);
    return (resp as unknown) as IApiResponse<ICart>;
  },

  removeFromCart: async (payload: IRemoveFromCartRequest): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.delete<IApiResponse<ICart>>('/carts/remove', { data: payload });
    return (resp as unknown) as IApiResponse<ICart>;
  },

  clearCart: async (): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.delete<IApiResponse<ICart>>('/carts/clear');
    return (resp as unknown) as IApiResponse<ICart>;
  },

  getAllCarts: async (): Promise<IApiResponse<ICart[]>> => {
    const resp = await axiosInstance.get<IApiResponse<ICart[]>>('/carts');
    return (resp as unknown) as IApiResponse<ICart[]>;
  },

  getCartById: async (cartId: string): Promise<IApiResponse<ICart>> => {
    const resp = await axiosInstance.get<IApiResponse<ICart>>(`/carts/${cartId}`);
    return (resp as unknown) as IApiResponse<ICart>;
  },
};