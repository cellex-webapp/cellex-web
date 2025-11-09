import axiosInstance from "@/utils/axiosInstance";

export const customerSegmentService = {
  getAllSegments: async (): Promise<IApiResponse<CustomerSegmentResponse[]>> => {
    const resp = await axiosInstance.get(`/customer-segments`);
    return (resp as unknown) as IApiResponse<CustomerSegmentResponse[]>;
  },

  getSegmentById: async (id: string): Promise<IApiResponse<CustomerSegmentResponse>> => {
    const resp = await axiosInstance.get(`/customer-segments/${id}`);
    return (resp as unknown) as IApiResponse<CustomerSegmentResponse>;
  },

  createSegment: async (payload: CreateCustomerSegmentRequest): Promise<IApiResponse<CustomerSegmentResponse>> => {
    const resp = await axiosInstance.post(`/customer-segments`, payload);
    return (resp as unknown) as IApiResponse<CustomerSegmentResponse>;
  },

  updateSegment: async (id: string, payload: UpdateCustomerSegmentRequest): Promise<IApiResponse<CustomerSegmentResponse>> => {
    const resp = await axiosInstance.put(`/customer-segments/${id}`, payload);
    return (resp as unknown) as IApiResponse<CustomerSegmentResponse>;
  },

  deleteSegment: async (id: string): Promise<IApiResponse<string>> => {
    const resp = await axiosInstance.delete(`/customer-segments/${id}`);
    return (resp as unknown) as IApiResponse<string>;
  },
};