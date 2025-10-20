import axiosInstance from "@/utils/axiosInstance";

export const attributeService = {
  getAttributesOfCategory: async (categoryId: string): Promise<IApiResponse<IAttribute[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IAttribute[]>>(
      `/categories/${categoryId}/attributes`
    );
    return (resp as unknown) as IApiResponse<IAttribute[]>;
  },

  getHighlightAttributesOfCategory: async (categoryId: string): Promise<IApiResponse<IAttribute[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IAttribute[]>>(
      `/categories/${categoryId}/attributes/highlight`
    );
    return (resp as unknown) as IApiResponse<IAttribute[]>;
  },

  createAttributeOfCategory: async (categoryId: string, payload: ICreateUpdateAttributePayload): Promise<IApiResponse<IAttribute>> => {
    const resp = await axiosInstance.post<IApiResponse<IAttribute>>(
      `/categories/${categoryId}/attributes`,
      payload
    );
    return (resp as unknown) as IApiResponse<IAttribute>;
  },

  updateAttributeOfCategory: async (categoryId: string, payload: ICreateUpdateAttributePayload & { id: string }): Promise<IApiResponse<IAttribute>> => {
    const { id, ...data } = payload;
    const resp = await axiosInstance.put<IApiResponse<IAttribute>>(
      `/categories/${categoryId}/attributes/${id}`,
      data
    );
    return (resp as unknown) as IApiResponse<IAttribute>;
  },

  deleteAttributeOfCategory: async (categoryId: string, attributeId: string): Promise<IApiResponse<null>> => {
    const resp = await axiosInstance.delete<IApiResponse<null>>(
      `/categories/${categoryId}/attributes/${attributeId}`
    );
    return (resp as unknown) as IApiResponse<null>;
  },
};