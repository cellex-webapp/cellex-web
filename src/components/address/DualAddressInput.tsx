import React, { useState, useEffect, useCallback } from 'react';
import useAddress from '@/hooks/useAddress';

export interface AddressInputValue {
  // Stored values (new system - saved to database)
  newWardCode: string;
  detailAddress: string;
  
  // Display values
  fullAddressNew?: string;
  fullAddressOld?: string;
}

export interface DualAddressInputProps {
  value?: AddressInputValue;
  onChange?: (value: AddressInputValue) => void;
  disabled?: boolean;
  showBothModes?: boolean;
  className?: string;
  label?: string;
  required?: boolean;
  error?: string;
}

type AddressMode = 'old' | 'new';

/**
 * Dual Address Input Component
 * Supports both old (3-level: Province -> District -> Ward) 
 * and new (2-level: Province -> Ward) address systems
 * with automatic sync between them
 */
const DualAddressInput: React.FC<DualAddressInputProps> = ({
  value,
  onChange,
  disabled = false,
  showBothModes = true,
  className = '',
  label = 'Địa chỉ',
  required = false,
  error,
}) => {
  const {
    // Data
    oldProvinces,
    oldDistricts,
    oldWards,
    newProvinces,
    newWards,
    // Loading
    loadingOldProvinces,
    loadingOldDistricts,
    loadingOldWards,
    loadingNewProvinces,
    loadingNewWards,
    loadingMapping,
    // Fetch
    fetchOldProvinces,
    fetchOldDistricts,
    fetchOldWards,
    fetchNewProvinces,
    fetchNewWards,
    // Reset
    resetOldDistricts,
    resetOldWards,
    resetNewWards,
    // Mapping
    mapWardCode,
  } = useAddress();

  // Current input mode
  const [mode, setMode] = useState<AddressMode>('new');

  // Old address state
  const [oldProvinceId, setOldProvinceId] = useState('');
  const [oldDistrictId, setOldDistrictId] = useState('');
  const [oldWardId, setOldWardId] = useState('');

  // New address state
  const [newProvinceCode, setNewProvinceCode] = useState('');
  const [newWardCode, setNewWardCode] = useState('');

  // Detail address
  const [detailAddress, setDetailAddress] = useState('');

  // Sync status
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncedOldAddress, setSyncedOldAddress] = useState<IOldAddressInfo | null>(null);
  const [syncedNewAddress, setSyncedNewAddress] = useState<INewAddressInfo | null>(null);

  // Initialize provinces on mount
  useEffect(() => {
    fetchOldProvinces();
    fetchNewProvinces();
  }, [fetchOldProvinces, fetchNewProvinces]);

  // Initialize from value prop
  useEffect(() => {
    if (value?.newWardCode && value.newWardCode !== newWardCode) {
      setNewWardCode(value.newWardCode);
      setDetailAddress(value.detailAddress || '');
      
      // Sync to get old address info
      syncFromNewWard(value.newWardCode);
    }
  }, [value?.newWardCode]);

  // Sync from old ward to new ward
  const syncFromOldWard = useCallback(async (wardId: string) => {
    if (!wardId) return;
    
    setIsSyncing(true);
    try {
      const mapping = await mapWardCode(wardId, 'old');
      if (mapping?.new_address) {
        setSyncedNewAddress(mapping.new_address);
        setNewWardCode(mapping.new_address.ward_code);
        
        // Find and set province in new system
        const newProvince = newProvinces.find(
          p => p.name === mapping.new_address?.province_name
        );
        if (newProvince) {
          setNewProvinceCode(newProvince.province_code);
          await fetchNewWards(newProvince.province_code);
        }
        
        // Build full addresses
        const selectedOldProvince = oldProvinces.find(p => p.id === oldProvinceId);
        const selectedOldDistrict = oldDistricts.find(d => d.id === oldDistrictId);
        const selectedOldWard = oldWards.find(w => w.id === wardId);
        
        const fullAddressOld = buildFullAddress(
          detailAddress,
          selectedOldWard?.name,
          selectedOldDistrict?.name,
          selectedOldProvince?.name
        );
        
        const fullAddressNew = buildFullAddress(
          detailAddress,
          mapping.new_address.ward_name,
          undefined,
          mapping.new_address.province_name
        );
        
        // Notify parent
        onChange?.({
          newWardCode: mapping.new_address.ward_code,
          detailAddress,
          fullAddressNew,
          fullAddressOld,
        });
      }
    } catch (err) {
      console.error('Error syncing from old ward:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [mapWardCode, newProvinces, oldProvinces, oldDistricts, oldWards, oldProvinceId, oldDistrictId, detailAddress, onChange, fetchNewWards]);

  // Sync from new ward to old wards
  const syncFromNewWard = useCallback(async (wardCode: string) => {
    if (!wardCode) return;
    
    setIsSyncing(true);
    try {
      const mapping = await mapWardCode(wardCode, 'new');
      if (mapping?.old_address) {
        setSyncedOldAddress(mapping.old_address);
        
        // Find old province
        const oldProvince = oldProvinces.find(
          p => p.name === mapping.old_address?.province_name
        );
        if (oldProvince) {
          setOldProvinceId(oldProvince.id);
          await fetchOldDistricts(oldProvince.id);
        }
      }
    } catch (err) {
      console.error('Error syncing from new ward:', err);
    } finally {
      setIsSyncing(false);
    }
  }, [mapWardCode, oldProvinces, fetchOldDistricts]);

  // Handle old province change
  const handleOldProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = e.target.value;
    setOldProvinceId(provinceId);
    setOldDistrictId('');
    setOldWardId('');
    resetOldDistricts();
    
    if (provinceId) {
      await fetchOldDistricts(provinceId);
    }
  };

  // Handle old district change
  const handleOldDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = e.target.value;
    setOldDistrictId(districtId);
    setOldWardId('');
    resetOldWards();
    
    if (districtId) {
      await fetchOldWards(districtId);
    }
  };

  // Handle old ward change
  const handleOldWardChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardId = e.target.value;
    setOldWardId(wardId);
    
    if (wardId) {
      await syncFromOldWard(wardId);
    }
  };

  // Handle new province change
  const handleNewProvinceChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceCode = e.target.value;
    setNewProvinceCode(provinceCode);
    setNewWardCode('');
    resetNewWards();
    
    if (provinceCode) {
      await fetchNewWards(provinceCode);
    }
  };

  // Handle new ward change
  const handleNewWardChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const wardCode = e.target.value;
    setNewWardCode(wardCode);
    
    if (wardCode) {
      const selectedWard = newWards.find(w => w.ward_code === wardCode);
      const selectedProvince = newProvinces.find(p => p.province_code === newProvinceCode);
      
      const fullAddressNew = buildFullAddress(
        detailAddress,
        selectedWard?.name,
        undefined,
        selectedProvince?.name
      );
      
      onChange?.({
        newWardCode: wardCode,
        detailAddress,
        fullAddressNew,
      });
      
      // Sync to old system
      await syncFromNewWard(wardCode);
    }
  };

  // Handle detail address change
  const handleDetailAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setDetailAddress(value);
    
    if (newWardCode) {
      const selectedWard = newWards.find(w => w.ward_code === newWardCode);
      const selectedProvince = newProvinces.find(p => p.province_code === newProvinceCode);
      
      const fullAddressNew = buildFullAddress(
        value,
        selectedWard?.name,
        undefined,
        selectedProvince?.name
      );
      
      let fullAddressOld: string | undefined;
      if (syncedOldAddress) {
        fullAddressOld = buildFullAddress(
          value,
          syncedOldAddress.ward_name,
          syncedOldAddress.district_name,
          syncedOldAddress.province_name
        );
      }
      
      onChange?.({
        newWardCode,
        detailAddress: value,
        fullAddressNew,
        fullAddressOld,
      });
    }
  };

  // Build full address string
  const buildFullAddress = (
    detail?: string,
    ward?: string,
    district?: string,
    province?: string
  ): string => {
    const parts: string[] = [];
    if (detail?.trim()) parts.push(detail.trim());
    if (ward?.trim()) parts.push(ward.trim());
    if (district?.trim()) parts.push(district.trim());
    if (province?.trim()) parts.push(province.trim());
    return parts.join(', ');
  };

  return (
    <div className={`dual-address-input ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700 mb-2">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}

      {/* Mode Selector */}
      <div className="flex items-center space-x-4 mb-4">
        <label className="text-sm text-gray-600">Chọn phương thức nhập:</label>
        <div className="flex space-x-2">
          <button
            type="button"
            onClick={() => setMode('new')}
            disabled={disabled}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              mode === 'new'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Địa chỉ mới (07/2025)
          </button>
          <button
            type="button"
            onClick={() => setMode('old')}
            disabled={disabled}
            className={`px-3 py-1 text-sm rounded-md transition-colors ${
              mode === 'old'
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            Địa chỉ cũ (trước 07/2025)
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* New Address Input (2 levels) */}
        <div className={`p-4 border rounded-lg ${mode === 'new' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-green-500 mr-2"></span>
            Địa chỉ mới (Sau 07/2025)
          </h4>
          
          <div className="space-y-3">
            {/* Province Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tỉnh/Thành phố</label>
              <select
                value={newProvinceCode}
                onChange={handleNewProvinceChange}
                disabled={disabled || mode !== 'new' || loadingNewProvinces}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Tỉnh/TP --</option>
                {newProvinces.map((province) => (
                  <option key={province.province_code} value={province.province_code}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phường/Xã</label>
              <select
                value={newWardCode}
                onChange={handleNewWardChange}
                disabled={disabled || mode !== 'new' || loadingNewWards || !newProvinceCode}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {newWards.map((ward) => (
                  <option key={ward.ward_code} value={ward.ward_code}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Synced info display */}
          {mode !== 'new' && syncedNewAddress && (
            <div className="mt-3 p-2 bg-green-100 rounded text-xs text-green-800">
              <strong>Đồng bộ từ địa chỉ cũ:</strong>
              <br />
              {syncedNewAddress.ward_name}, {syncedNewAddress.province_name}
            </div>
          )}
        </div>

        {/* Old Address Input (3 levels) */}
        <div className={`p-4 border rounded-lg ${mode === 'old' ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-gray-50'}`}>
          <h4 className="font-medium text-gray-800 mb-3 flex items-center">
            <span className="w-2 h-2 rounded-full bg-orange-500 mr-2"></span>
            Địa chỉ cũ (Trước 07/2025)
          </h4>
          
          <div className="space-y-3">
            {/* Province Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Tỉnh/Thành phố</label>
              <select
                value={oldProvinceId}
                onChange={handleOldProvinceChange}
                disabled={disabled || mode !== 'old' || loadingOldProvinces}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Tỉnh/TP --</option>
                {oldProvinces.map((province) => (
                  <option key={province.id} value={province.id}>
                    {province.name}
                  </option>
                ))}
              </select>
            </div>

            {/* District Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Quận/Huyện</label>
              <select
                value={oldDistrictId}
                onChange={handleOldDistrictChange}
                disabled={disabled || mode !== 'old' || loadingOldDistricts || !oldProvinceId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Quận/Huyện --</option>
                {oldDistricts.map((district) => (
                  <option key={district.id} value={district.id}>
                    {district.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Ward Select */}
            <div>
              <label className="block text-xs text-gray-500 mb-1">Phường/Xã</label>
              <select
                value={oldWardId}
                onChange={handleOldWardChange}
                disabled={disabled || mode !== 'old' || loadingOldWards || !oldDistrictId}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
              >
                <option value="">-- Chọn Phường/Xã --</option>
                {oldWards.map((ward) => (
                  <option key={ward.id} value={ward.id}>
                    {ward.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Synced info display */}
          {mode !== 'old' && syncedOldAddress && (
            <div className="mt-3 p-2 bg-orange-100 rounded text-xs text-orange-800">
              <strong>Đồng bộ từ địa chỉ mới:</strong>
              <br />
              {syncedOldAddress.ward_name}, {syncedOldAddress.district_name}, {syncedOldAddress.province_name}
            </div>
          )}
        </div>
      </div>

      {/* Detail Address Input */}
      <div className="mt-4">
        <label className="block text-xs text-gray-500 mb-1">Địa chỉ chi tiết (Số nhà, đường, tòa nhà...)</label>
        <input
          type="text"
          value={detailAddress}
          onChange={handleDetailAddressChange}
          disabled={disabled}
          placeholder="Ví dụ: 123 Đường ABC, Tòa nhà XYZ"
          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100"
        />
      </div>

      {/* Loading indicator */}
      {(isSyncing || loadingMapping) && (
        <div className="mt-2 flex items-center text-sm text-blue-600">
          <svg className="animate-spin h-4 w-4 mr-2" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Đang đồng bộ địa chỉ...
        </div>
      )}

      {/* Error display */}
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}

      {/* Full Address Preview */}
      {newWardCode && (
        <div className="mt-4 p-3 bg-gray-100 rounded-lg">
          <p className="text-xs text-gray-500 mb-1">Địa chỉ đầy đủ:</p>
          <p className="text-sm font-medium text-gray-800">
            {buildFullAddress(
              detailAddress,
              newWards.find(w => w.ward_code === newWardCode)?.name,
              undefined,
              newProvinces.find(p => p.province_code === newProvinceCode)?.name
            )}
          </p>
        </div>
      )}
    </div>
  );
};

export default DualAddressInput;
