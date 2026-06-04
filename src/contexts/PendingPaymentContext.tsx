import React, { createContext, useContext, useState, useEffect } from 'react';
import type { ReactNode } from 'react';
import { orderService } from '@/services/order.service';
import { useAuth } from '@/hooks/useAuth';

interface PendingPaymentContextType {
  pendingOrders: IOrder[];
  refreshPendingOrders: () => Promise<void>;
  isLoading: boolean;
}

const PendingPaymentContext = createContext<PendingPaymentContextType | undefined>(undefined);

export const PendingPaymentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [pendingOrders, setPendingOrders] = useState<IOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { isAuthenticated } = useAuth();

  const refreshPendingOrders = async () => {
    if (!isAuthenticated) return;
    try {
      setIsLoading(true);
      const orders = await orderService.getPendingPaymentOrders();
      setPendingOrders(orders);
    } catch (error) {
      console.error('Failed to fetch pending payment orders', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Poll every 30 seconds
  useEffect(() => {
    if (isAuthenticated) {
      refreshPendingOrders();
      const intervalId = setInterval(refreshPendingOrders, 30000);
      return () => clearInterval(intervalId);
    } else {
      setPendingOrders([]);
    }
  }, [isAuthenticated]);

  return (
    <PendingPaymentContext.Provider value={{ pendingOrders, refreshPendingOrders, isLoading }}>
      {children}
    </PendingPaymentContext.Provider>
  );
};

export const usePendingPaymentContext = () => {
  const context = useContext(PendingPaymentContext);
  if (context === undefined) {
    throw new Error('usePendingPaymentContext must be used within a PendingPaymentProvider');
  }
  return context;
};
