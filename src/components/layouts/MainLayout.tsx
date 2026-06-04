import React from 'react';
import { PendingPaymentBanner } from '@/components/common/PendingPaymentBanner';

export const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="h-screen w-full overflow-hidden bg-slate-50 relative">
      {children}
      <PendingPaymentBanner />
    </div>
  );
};