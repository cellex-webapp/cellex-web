import type { RootState } from '@/stores/store';

export const selectVnpayState = (state: RootState) => state.vnpay;
export const selectVnpayPaymentUrl = (state: RootState) => state.vnpay.paymentUrl;
export const selectVnpayPaymentStatus = (state: RootState) => state.vnpay.paymentStatus;
export const selectVnpayLoading = (state: RootState) => state.vnpay.isLoading;
export const selectVnpayError = (state: RootState) => state.vnpay.error;
