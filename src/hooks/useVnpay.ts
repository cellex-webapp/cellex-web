import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { createVnpayPayment, fetchVnpayStatus, clearVnpayState } from '@/stores/slices/vnpay.slice';
import { selectVnpayPaymentUrl, selectVnpayPaymentStatus, selectVnpayError, selectVnpayLoading } from '@/stores/selectors/vnpay.selector';

export const useVnpay = () => {
  const dispatch = useDispatch<AppDispatch>();
  const paymentUrl = useSelector(selectVnpayPaymentUrl);
  const paymentStatus = useSelector(selectVnpayPaymentStatus);
  const isLoading = useSelector(selectVnpayLoading);
  const error = useSelector(selectVnpayError);

  const createPayment = useCallback(async (body: VnpayPaymentRequest) => {
    const action = await dispatch(createVnpayPayment(body));
    return action;
  }, [dispatch]);

  const getStatus = useCallback(async (orderId: string) => {
    const action = await dispatch(fetchVnpayStatus(orderId));
    return action;
  }, [dispatch]);

  const reset = useCallback(() => {
    dispatch(clearVnpayState());
  }, [dispatch]);

  return { paymentUrl, paymentStatus, isLoading, error, createPayment, getStatus, reset };
};

export default useVnpay;
