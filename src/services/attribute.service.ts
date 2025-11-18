import axiosInstance from "@/utils/axiosInstance";

export const attributeService = {
  getAttributesOfCategory: async (categoryId: string, params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IAttribute>>>(
      `/categories/${categoryId}/attributes`,
      { params }
    );
    return response.data;
  },

  getHighlightAttributesOfCategory: async (categoryId: string) => {
    const response = await axiosInstance.get<IApiResponse<IAttribute[]>>(
      `/categories/${categoryId}/attributes/highlight`
    );
    return response.data;
  },

  createAttributeOfCategory: async (categoryId: string, payload: ICreateUpdateAttributePayload) => {
    const response = await axiosInstance.post<IApiResponse<IAttribute>>(
      `/categories/${categoryId}/attributes`,
      payload
    );
    return response.data;
  },

  updateAttributeOfCategory: async (categoryId: string, payload: ICreateUpdateAttributePayload & { id: string }) => {
    const { id, ...data } = payload;
    const response = await axiosInstance.put<IApiResponse<IAttribute>>(
      `/categories/${categoryId}/attributes/${id}`,
      data
    );
    return response.data;
  },

  deleteAttributeOfCategory: async (categoryId: string, attributeId: string) => {
    const response = await axiosInstance.delete<IApiResponse<null>>(
      `/categories/${categoryId}/attributes/${attributeId}`
    );
    return response.data;
  },
};