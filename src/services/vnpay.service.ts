import axiosInstance from '@/utils/axiosInstance';

export const vnpayService = {
  createPayment: async (body: VnpayPaymentRequest): Promise<VnpayPaymentResponse> => {
    const resp = await axiosInstance.post('/vnpay/create-payment', body);
    // Flexible response mapping
    const data = resp.data;
    const paymentUrl = data?.result?.paymentUrl || data?.paymentUrl || data?.result?.url || data?.url;
    if (!paymentUrl) {
      throw new Error('Không nhận được paymentUrl từ máy chủ');
    }
    return { paymentUrl };
  },
  getPaymentStatus: async (orderId: string): Promise<any> => {
    const resp = await axiosInstance.get(`/vnpay/status/${orderId}`);
    return resp.data?.result || resp.data;
  },
};

export default vnpayService;
