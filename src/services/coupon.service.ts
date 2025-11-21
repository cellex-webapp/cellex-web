import axiosInstance from '@/utils/axiosInstance';

export const couponService = {
  createCampaign: async (payload: CreateCampaignRequest) => {
    const resp = await axiosInstance.post<IApiResponse<CouponCampaignResponse>>('/coupon-campaigns', payload);
    return resp.data;
  },
  getAllCampaigns: async () => {
    const resp = await axiosInstance.get<IApiResponse<CouponCampaignResponse[]>>('/coupon-campaigns');
    return resp.data;
  },
  getCampaignsByStatus: async (status: CampaignStatus) => {
    const resp = await axiosInstance.get<IApiResponse<CouponCampaignResponse[]>>(`/coupon-campaigns/status/${status}`);
    return resp.data;
  },
  getCampaignById: async (id: string) => {
    const resp = await axiosInstance.get<IApiResponse<CouponCampaignResponse>>(`/coupon-campaigns/${id}`);
    return resp.data;
  },
  updateCampaign: async (id: string, payload: UpdateCampaignRequest) => {
    const resp = await axiosInstance.put<IApiResponse<CouponCampaignResponse>>(`/coupon-campaigns/${id}`, payload);
    return resp.data;
  },
  deleteCampaign: async (id: string) => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/coupon-campaigns/${id}`);
    return resp.data;
  },
  distributeCampaign: async (payload: DistributeCampaignRequest) => {
    const resp = await axiosInstance.post<IApiResponse<CampaignDistributionResponse>>('/coupon-campaigns/distribute', payload);
    return resp.data;
  },
  getCampaignDistributionLogs: async (id: string) => {
    const resp = await axiosInstance.get<IApiResponse<CampaignDistributionResponse[]>>(`/coupon-campaigns/${id}/distribution-logs`);
    return resp.data;
  },
  getMyCoupons: async () => {
    const resp = await axiosInstance.get<IApiResponse<IUserCoupon[]>>('/user-coupons/my-coupons');
    return resp.data;
  },
  // Segment Coupons (Admin)
  getAllSegmentCoupons: async () => {
    const resp = await axiosInstance.get<IApiResponse<SegmentCouponResponse[]>>('/segment-coupons');
    return resp.data;
  },
  getSegmentCouponById: async (id: string) => {
    const resp = await axiosInstance.get<IApiResponse<SegmentCouponResponse>>(`/segment-coupons/${id}`);
    return resp.data;
  },
  getSegmentCouponsBySegmentId: async (segmentId: string) => {
    const resp = await axiosInstance.get<IApiResponse<SegmentCouponResponse[]>>(`/segment-coupons/segment/${segmentId}`);
    return resp.data;
  },
  createSegmentCoupon: async (payload: CreateSegmentCouponRequest) => {
    const resp = await axiosInstance.post<IApiResponse<SegmentCouponResponse>>('/segment-coupons', payload);
    return resp.data;
  },
  updateSegmentCoupon: async (id: string, payload: UpdateSegmentCouponRequest) => {
    const resp = await axiosInstance.put<IApiResponse<SegmentCouponResponse>>(`/segment-coupons/${id}`, payload);
    return resp.data;
  },
  deleteSegmentCoupon: async (id: string) => {
    const resp = await axiosInstance.delete<IApiResponse<string>>(`/segment-coupons/${id}`);
    return resp.data;
  },
};