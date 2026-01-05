import React, { useState, useEffect } from 'react';
import { addressService } from '@/services/address.service';

export interface DualAddressDisplayProps {
  newWardCode: string;
  detailAddress?: string;
  compact?: boolean;
  className?: string;
}

/**
 * Component to display address in new format only
 * Fetches address mapping from backend and displays new address representation
 */
const DualAddressDisplay: React.FC<DualAddressDisplayProps> = ({
  newWardCode,
  detailAddress,
  compact = false,
  className = '',
}) => {
  const [dualAddress, setDualAddress] = useState<IDualAddressResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchDualAddress = async () => {
      if (!newWardCode) {
        setDualAddress(null);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const response = await addressService.getDualAddress(newWardCode, detailAddress);
        if (response.result) {
          setDualAddress(response.result);
        } else {
          setError('Không tìm thấy thông tin địa chỉ');
        }
      } catch (err) {
        setError('Lỗi khi tải thông tin địa chỉ');
        console.error('Error fetching dual address:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDualAddress();
  }, [newWardCode, detailAddress]);

  if (loading) {
    return (
      <div className={`flex items-center text-gray-500 ${className}`}>
        <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
        Đang tải địa chỉ...
      </div>
    );
  }

  if (error) {
    return (
      <div className={`text-red-500 text-sm ${className}`}>
        {error}
      </div>
    );
  }

  if (!dualAddress) {
    return (
      <div className={`text-gray-400 text-sm italic ${className}`}>
        Chưa có thông tin địa chỉ
      </div>
    );
  }

  // Compact display mode
  if (compact) {
    return (
      <div className={`${className}`}>
        <p className="text-sm text-gray-800">
          {dualAddress.full_address_new}
        </p>
      </div>
    );
  }

  // Full display mode - Only show new address
  return (
    <div className={`space-y-4 ${className}`}>
      {/* New Address Format */}
      <div className="border border-green-200 rounded-lg p-4 bg-green-50">
        <div className="flex items-center mb-2">
          <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
          <h4 className="font-medium text-green-800 text-sm">
            Địa chỉ mới (Sau 07/2025)
          </h4>
        </div>
        
        <div className="space-y-1 text-sm">
          <div className="flex">
            <span className="text-gray-500 w-24">Tỉnh/TP:</span>
            <span className="text-gray-800">{dualAddress.new_address.province_name}</span>
          </div>
          <div className="flex">
            <span className="text-gray-500 w-24">Phường/Xã:</span>
            <span className="text-gray-800">{dualAddress.new_address.ward_name}</span>
          </div>
          {dualAddress.detail_address && (
            <div className="flex">
              <span className="text-gray-500 w-24">Chi tiết:</span>
              <span className="text-gray-800">{dualAddress.detail_address}</span>
            </div>
          )}
        </div>

        <div className="mt-3 pt-3 border-t border-green-200">
          <p className="text-xs text-gray-500">Địa chỉ đầy đủ:</p>
          <p className="text-sm font-medium text-gray-800">{dualAddress.full_address_new}</p>
        </div>
      </div>
    </div>
  );
};

export default DualAddressDisplay;
