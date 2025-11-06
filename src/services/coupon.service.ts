import axiosInstance from "@/utils/axiosInstance";
const API_PATH = '/coupon-campaigns'; 

export const couponService = {
  createCampaign: async (payload: CreateCampaignRequest): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.post(API_PATH, payload);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  getAllCampaigns: async (): Promise<IApiResponse<CouponCampaignResponse[]>> => {
    const resp = await axiosInstance.get(API_PATH);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse[]>;
  },

  getCampaignsByStatus: async (status: CampaignStatus): Promise<IApiResponse<CouponCampaignResponse[]>> => {
    const resp = await axiosInstance.get(`${API_PATH}/status/${status}`);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse[]>;
  },

  getCampaignById: async (id: string): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.get(`${API_PATH}/${id}`);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  updateCampaign: async (id: string, payload: UpdateCampaignRequest): Promise<IApiResponse<CouponCampaignResponse>> => {
    const resp = await axiosInstance.put(`${API_PATH}/${id}`, payload);
    return (resp as unknown) as IApiResponse<CouponCampaignResponse>;
  },

  deleteCampaign: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete(`${API_PATH}/${id}`);
    return (resp as unknown) as IApiResponse<void>;
  },

  distributeCampaign: async (payload: DistributeCampaignRequest): Promise<IApiResponse<CampaignDistributionResponse>> => {
    const resp = await axiosInstance.post(`${API_PATH}/distribute`, payload);
    return (resp as unknown) as IApiResponse<CampaignDistributionResponse>;
  },

  getCampaignDistributionLogs: async (id: string): Promise<IApiResponse<CampaignDistributionResponse[]>> => {
    const resp = await axiosInstance.get(`${API_PATH}/${id}/distribution-logs`);
    return (resp as unknown) as IApiResponse<CampaignDistributionResponse[]>;
  }
};