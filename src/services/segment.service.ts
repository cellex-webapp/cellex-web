import axiosInstance from '@/utils/axiosInstance';

export const customerSegmentService = {
  getAllSegments: async () => {
    const resp = await axiosInstance.get<IApiResponse<CustomerSegmentResponse[]>>('/customer-segments');
    return resp.data;
  },
  getSegmentById: async (id: string) => {
    const resp = await axiosInstance.get<IApiResponse<CustomerSegmentResponse>>(`/customer-segments/${id}`);
    return resp.data;
  },
  createSegment: async (payload: CreateCustomerSegmentRequest) => {
    const resp = await axiosInstance.post<IApiResponse<CustomerSegmentResponse>>('/customer-segments', payload);
    return resp.data;
  },
  updateSegment: async (id: string, payload: UpdateCustomerSegmentRequest) => {
    const resp = await axiosInstance.put<IApiResponse<CustomerSegmentResponse>>(`/customer-segments/${id}`, payload);
    return resp.data;
  },
  deleteSegment: async (id: string) => {
    const resp = await axiosInstance.delete<IApiResponse<string>>(`/customer-segments/${id}`);
    return resp.data;
  },
};