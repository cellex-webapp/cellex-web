import { useState, useEffect } from 'react';
import { usePendingPaymentContext } from '../contexts/PendingPaymentContext';

export const usePendingPayment = () => {
  const { pendingOrders, refreshPendingOrders, isLoading } = usePendingPaymentContext();
  const [now, setNow] = useState(new Date().getTime());

  useEffect(() => {
    if (pendingOrders.length === 0) return;

    const intervalId = setInterval(() => {
      setNow(new Date().getTime());
    }, 1000);

    return () => clearInterval(intervalId);
  }, [pendingOrders]);

  // Lọc ra các order chưa hết hạn
  const activePendingOrders = pendingOrders.filter(order => {
    if (!order.payment_expires_at) return false;
    const expiresAt = new Date(order.payment_expires_at).getTime();
    return expiresAt > now;
  });

  return {
    activePendingOrders,
    refreshPendingOrders,
    isLoading,
    now
  };
};
