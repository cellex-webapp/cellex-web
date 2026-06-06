import axiosInstance from '@/utils/axiosInstance';

export const warrantyService = {
  // Lấy chính sách bảo hành của một sản phẩm
  getProductPolicy: async (productId: string): Promise<IApiResponse<IWarrantyPolicy>> => {
    const resp = await axiosInstance.get<IApiResponse<IWarrantyPolicy>>(`/warranties/products/${productId}/policy`);
    return resp.data;
  },

  // Tạo phiếu yêu cầu bảo hành
  createClaim: async (body: ICreateWarrantyClaimRequest): Promise<IApiResponse<IWarrantyClaim>> => {
    const resp = await axiosInstance.post<IApiResponse<IWarrantyClaim>>('/warranties/claims', body);
    return resp.data;
  },

  // Lấy danh sách phiếu bảo hành của tôi (user)
  getMyClaims: async (): Promise<IApiResponse<IWarrantyClaimDetail[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IWarrantyClaimDetail[]>>('/warranties/my-claims');
    return resp.data;
  },

  // VENDOR: Lấy danh sách phiếu bảo hành của shop
  getShopClaims: async (params?: {
    page?: number;
    limit?: number;
    status?: string;
    sortBy?: string;
    sortType?: string;
  }): Promise<IApiResponse<IPage<IWarrantyClaimDetail>>> => {
    const resp = await axiosInstance.get<IApiResponse<IPage<IWarrantyClaimDetail>>>('/warranties/shop/claims', { params });
    return resp.data;
  },

  // VENDOR: Cập nhật trạng thái và phản hồi phiếu bảo hành
  respondToClaim: async (
    claimId: string,
    body: IRespondWarrantyClaimRequest
  ): Promise<IApiResponse<IWarrantyClaimDetail>> => {
    const resp = await axiosInstance.put<IApiResponse<IWarrantyClaimDetail>>(`/warranties/claims/${claimId}/respond`, body);
    return resp.data;
  },
};