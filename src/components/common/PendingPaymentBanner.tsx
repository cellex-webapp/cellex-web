import React, { useState } from 'react';
import { usePendingPayment } from '@/hooks/usePendingPayment';
import { orderService } from '@/services/order.service';
import { AlertCircle, Clock, ExternalLink, X } from 'lucide-react';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
  }).format(amount);
};

export const PendingPaymentBanner: React.FC = () => {
  const { activePendingOrders, now } = usePendingPayment();
  const [closedBanners, setClosedBanners] = useState<Set<string>>(new Set());

  if (activePendingOrders.length === 0) return null;

  const handlePayNow = async (orderId: string) => {
    try {
      const resp = await orderService.getRepaymentUrl(orderId);
      if (resp?.paymentUrl) {
        window.location.href = resp.paymentUrl;
      }
    } catch (error) {
      console.error('Failed to get repayment URL', error);
      alert('Không thể tạo lại link thanh toán. Vui lòng thử lại sau.');
    }
  };

  const handleClose = (orderId: string) => {
    setClosedBanners(prev => new Set(prev).add(orderId));
  };

  return (
    <div className="fixed bottom-24 right-4 z-[9999] flex flex-col gap-3 max-w-sm w-full">
      {activePendingOrders
        .filter(order => !closedBanners.has(order.id))
        .map(order => {
          const expiresAt = new Date(order.payment_expires_at!).getTime();
          const timeLeft = expiresAt - now;

          if (timeLeft <= 0) return null;

          const minutes = Math.floor(timeLeft / 60000);
          const seconds = Math.floor((timeLeft % 60000) / 1000);

          return (
            <div key={order.id} className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded shadow-lg relative flex flex-col gap-2">
              <button
                onClick={() => handleClose(order.id)}
                className="absolute top-2 right-2 text-gray-400 hover:text-gray-600"
              >
                <X size={16} />
              </button>

              <div className="flex items-start gap-3">
                <AlertCircle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                <div className="flex-1">
                  <h4 className="font-semibold text-orange-800 text-sm">
                    Đơn hàng {order.order_code} chưa thanh toán!
                  </h4>
                  <p className="text-sm text-orange-700 mt-1">
                    Tổng tiền: <span className="font-semibold">{formatCurrency(order.total_amount)}</span>
                  </p>
                  <div className="flex items-center gap-1.5 text-orange-600 text-sm mt-1.5 font-medium">
                    <Clock size={14} />
                    Hủy tự động sau: {minutes}:{seconds.toString().padStart(2, '0')}
                  </div>
                </div>
              </div>

              <button
                onClick={() => handlePayNow(order.id)}
                className="mt-2 w-full bg-orange-500 hover:bg-orange-600 text-white text-sm font-medium py-2 px-4 rounded transition-colors flex items-center justify-center gap-2"
              >
                Thanh toán ngay <ExternalLink size={14} />
              </button>
            </div>
          );
        })}
    </div>
  );
};
