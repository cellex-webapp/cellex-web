import axiosInstance from "@/utils/axiosInstance";

export const couponService = {
  createCampaign: async (payload: CreateCampaignRequest): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.post('/coupon-campaigns', payload);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  getAllCampaigns: async (): Promise<IApiResponse<CouponCampaignResponse[]>> => {
    const resp = await axiosInstance.get('/coupon-campaigns');
    return (resp as unknown) as IApiResponse<CouponCampaignResponse[]>;
  },

  getCampaignsByStatus: async (status: CampaignStatus): Promise<IApiResponse<CouponCampaignResponse[]>> => {
    const resp = await axiosInstance.get(`/coupon-campaigns/status/${status}`);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse[]>;
  },

  getCampaignById: async (id: string): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.get(`/coupon-campaigns/${id}`);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  updateCampaign: async (id: string, payload: UpdateCampaignRequest): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.put(`/coupon-campaigns/${id}`, payload);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  deleteCampaign: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete(`/coupon-campaigns/${id}`);
    return (resp as unknown) as IApiResponse<void>;
  },

  distributeCampaign: async (payload: DistributeCampaignRequest): Promise<IApiResponse<CampaignDistributionResponse>> => {
    const resp = await axiosInstance.post(`/coupon-campaigns/distribute`, payload);
    return (resp as unknown) as IApiResponse<CampaignDistributionResponse>;
  },

  getCampaignDistributionLogs: async (id: string): Promise<IApiResponse<CampaignDistributionResponse[]>> => {
    const resp = await axiosInstance.get(`/coupon-campaigns/${id}/distribution-logs`);
    return (resp as unknown) as IApiResponse<CampaignDistributionResponse[]>;
  },

  getMyCoupons: async (): Promise<IApiResponse<IUserCoupon[]>> => {
    const resp = await axiosInstance.get('/user-coupons/my-coupons');
    return (resp as unknown) as IApiResponse<IUserCoupon[]>;
  }
};