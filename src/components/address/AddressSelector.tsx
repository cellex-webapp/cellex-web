import React, { useState, useEffect, useCallback } from 'react';
import { Form, Select, Input, Radio, Card, Tag, Space, Spin, message } from 'antd';
import { EnvironmentOutlined, SwapOutlined } from '@ant-design/icons';
import useAddress from '@/hooks/useAddress';

export interface AddressSelectorValue {
  // Values to store in database (new system)
  newWardCode: string;
  detailAddress: string;
  // Full address strings for display
  fullAddressNew?: string;
  fullAddressOld?: string;
  // Province code for new system (for convenience)
  newProvinceCode?: string;
}

export interface AddressSelectorProps {
  value?: AddressSelectorValue;
  onChange?: (value: AddressSelectorValue) => void;
  disabled?: boolean;
  required?: boolean;
  showModeSelector?: boolean;
  defaultMode?: 'old' | 'new';
  layout?: 'horizontal' | 'vertical';
  size?: 'small' | 'middle' | 'large';
}

type AddressMode = 'old' | 'new';

/**
 * Reusable Address Selector Component with Ant Design
 * Supports both old (3-level) and new (2-level) address systems
 * with automatic synchronization between them
 */
const AddressSelector: React.FC<AddressSelectorProps> = ({
  value,
  onChange,
  disabled = false,
  required = false,
  showModeSelector = true,
  defaultMode = 'new',
  layout = 'vertical',
  size = 'middle',
}) => {
  const {
    oldProvinces,
    oldDistricts,
    oldWards,
    newProvinces,
    newWards,
    loadingOldProvinces,
    loadingOldDistricts,
    loadingOldWards,
    loadingNewProvinces,
    loadingNewWards,
    loadingMapping,
    fetchOldProvinces,
    fetchOldDistricts,
    fetchOldWards,
    fetchNewProvinces,
    fetchNewWards,
    resetOldDistricts,
    resetOldWards,
    resetNewWards,
    mapWardCode,
  } = useAddress();

  // Input mode
  const [mode, setMode] = useState<AddressMode>(defaultMode);

  // Old address state
  const [oldProvinceId, setOldProvinceId] = useState<string>('');
  const [oldDistrictId, setOldDistrictId] = useState<string>('');
  const [oldWardId, setOldWardId] = useState<string>('');

  // New address state
  const [newProvinceCode, setNewProvinceCode] = useState<string>('');
  const [newWardCode, setNewWardCode] = useState<string>('');

  // Detail address
  const [detailAddress, setDetailAddress] = useState<string>('');

  // Synced address info
  const [syncedOldAddress, setSyncedOldAddress] = useState<IOldAddressInfo | null>(null);
  const [syncedNewAddress, setSyncedNewAddress] = useState<INewAddressInfo | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Load provinces on mount
  useEffect(() => {
    fetchOldProvinces();
    fetchNewProvinces();
  }, [fetchOldProvinces, fetchNewProvinces]);

  // Initialize from value prop
  useEffect(() => {
    if (value?.newWardCode && value.newWardCode !== newWardCode) {
      setNewWardCode(value.newWardCode);
      setDetailAddress(value.detailAddress || '');
      if (value.newProvinceCode) {
        setNewProvinceCode(value.newProvinceCode);
        fetchNewWards(value.newProvinceCode);
      }
      // Sync to get old address info
      syncFromNewWard(value.newWardCode);
    }
  }, [value?.newWardCode]);

  // Build full address string
  const buildFullAddress = useCallback((
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
  }, []);

  // Notify parent of changes
  const notifyChange = useCallback((
    wardCode: string,
    detail: string,
    provinceCode?: string,
    fullNew?: string,
    fullOld?: string
  ) => {
    onChange?.({
      newWardCode: wardCode,
      detailAddress: detail,
      newProvinceCode: provinceCode,
      fullAddressNew: fullNew,
      fullAddressOld: fullOld,
    });
  }, [onChange]);

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
        
        notifyChange(
          mapping.new_address.ward_code,
          detailAddress,
          newProvince?.province_code,
          fullAddressNew,
          fullAddressOld
        );
      }
    } catch (err) {
      console.error('Error syncing from old ward:', err);
      message.warning('Không thể đồng bộ địa chỉ');
    } finally {
      setIsSyncing(false);
    }
  }, [mapWardCode, newProvinces, oldProvinces, oldDistricts, oldWards, oldProvinceId, oldDistrictId, detailAddress, buildFullAddress, notifyChange, fetchNewWards]);

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
  const handleOldProvinceChange = async (provinceId: string) => {
    setOldProvinceId(provinceId);
    setOldDistrictId('');
    setOldWardId('');
    resetOldDistricts();
    
    if (provinceId) {
      await fetchOldDistricts(provinceId);
    }
  };

  // Handle old district change
  const handleOldDistrictChange = async (districtId: string) => {
    setOldDistrictId(districtId);
    setOldWardId('');
    resetOldWards();
    
    if (districtId) {
      await fetchOldWards(districtId);
    }
  };

  // Handle old ward change
  const handleOldWardChange = async (wardId: string) => {
    setOldWardId(wardId);
    if (wardId) {
      await syncFromOldWard(wardId);
    }
  };

  // Handle new province change
  const handleNewProvinceChange = async (provinceCode: string) => {
    setNewProvinceCode(provinceCode);
    setNewWardCode('');
    resetNewWards();
    
    if (provinceCode) {
      await fetchNewWards(provinceCode);
    }
  };

  // Handle new ward change
  const handleNewWardChange = async (wardCode: string) => {
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
      
      notifyChange(wardCode, detailAddress, newProvinceCode, fullAddressNew);
      
      // Sync to old system
      await syncFromNewWard(wardCode);
    }
  };

  // Handle detail address change
  const handleDetailAddressChange = (value: string) => {
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
      
      notifyChange(newWardCode, value, newProvinceCode, fullAddressNew, fullAddressOld);
    }
  };

  const isHorizontal = layout === 'horizontal';

  return (
    <div className="address-selector">
      {/* Mode Selector */}
      {showModeSelector && (
        <div className="mb-4">
          <Radio.Group
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            disabled={disabled}
            size={size}
            buttonStyle="solid"
          >
            <Radio.Button value="new">
              <Space>
                <span className="w-2 h-2 rounded-full bg-green-500 inline-block"></span>
                Địa chỉ mới (07/2025)
              </Space>
            </Radio.Button>
            <Radio.Button value="old">
              <Space>
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block"></span>
                Địa chỉ cũ (trước 07/2025)
              </Space>
            </Radio.Button>
          </Radio.Group>
        </div>
      )}

      {/* New Address Input (2 levels) - Only shown when mode === 'new' */}
      {mode === 'new' && (
        <Card
          size="small"
          className="border-green-500 bg-green-50 mb-4"
          title={
            <Space>
              <EnvironmentOutlined className="text-green-600" />
              <span>Địa chỉ mới</span>
              <Tag color="green">07/2025</Tag>
            </Space>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={newProvinceCode || undefined}
                onChange={handleNewProvinceChange}
                placeholder="Chọn Tỉnh/TP"
                disabled={disabled}
                loading={loadingNewProvinces}
                showSearch
                optionFilterProp="label"
                size={size}
                className="w-full"
                options={newProvinces.map((p) => ({
                  value: p.province_code,
                  label: p.name,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Phường/Xã {required && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={newWardCode || undefined}
                onChange={handleNewWardChange}
                placeholder="Chọn Phường/Xã"
                disabled={disabled || !newProvinceCode}
                loading={loadingNewWards}
                showSearch
                optionFilterProp="label"
                size={size}
                className="w-full"
                options={newWards.map((w) => ({
                  value: w.ward_code,
                  label: w.name,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Địa chỉ chi tiết {required && <span className="text-red-500">*</span>}
              </label>
              <Input.TextArea
                value={detailAddress}
                onChange={(e) => handleDetailAddressChange(e.target.value)}
                disabled={disabled}
                placeholder="Số nhà, tên đường, tòa nhà..."
                rows={2}
                size={size}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Old Address Input (3 levels) - Only shown when mode === 'old' */}
      {mode === 'old' && (
        <Card
          size="small"
          className="border-orange-500 bg-orange-50 mb-4"
          title={
            <Space>
              <EnvironmentOutlined className="text-orange-600" />
              <span>Địa chỉ cũ</span>
              <Tag color="orange">Trước 07/2025</Tag>
            </Space>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Tỉnh/Thành phố {required && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={oldProvinceId || undefined}
                onChange={handleOldProvinceChange}
                placeholder="Chọn Tỉnh/TP"
                disabled={disabled}
                loading={loadingOldProvinces}
                showSearch
                optionFilterProp="label"
                size={size}
                className="w-full"
                options={oldProvinces.map((p) => ({
                  value: p.id,
                  label: p.name,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Quận/Huyện {required && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={oldDistrictId || undefined}
                onChange={handleOldDistrictChange}
                placeholder="Chọn Quận/Huyện"
                disabled={disabled || !oldProvinceId}
                loading={loadingOldDistricts}
                showSearch
                optionFilterProp="label"
                size={size}
                className="w-full"
                options={oldDistricts.map((d) => ({
                  value: d.id,
                  label: d.name,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Phường/Xã {required && <span className="text-red-500">*</span>}
              </label>
              <Select
                value={oldWardId || undefined}
                onChange={handleOldWardChange}
                placeholder="Chọn Phường/Xã"
                disabled={disabled || !oldDistrictId}
                loading={loadingOldWards}
                showSearch
                optionFilterProp="label"
                size={size}
                className="w-full"
                options={oldWards.map((w) => ({
                  value: w.id,
                  label: w.name,
                }))}
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Địa chỉ chi tiết {required && <span className="text-red-500">*</span>}
              </label>
              <Input.TextArea
                value={detailAddress}
                onChange={(e) => handleDetailAddressChange(e.target.value)}
                disabled={disabled}
                placeholder="Số nhà, tên đường, tòa nhà..."
                rows={2}
                size={size}
              />
            </div>
          </div>
        </Card>
      )}

      {/* Syncing indicator */}
      {(isSyncing || loadingMapping) && (
        <div className="mb-4 flex items-center text-sm text-blue-600">
          <Spin size="small" className="mr-2" />
          Đang đồng bộ địa chỉ...
        </div>
      )}

      {/* Full Address Preview - Only show if address is filled */}
      {newWardCode && detailAddress && (
        <div className="space-y-3">
          {/* Show new address always */}
          <Card size="small" className="bg-gray-100 border-gray-300">
            <div className="text-xs text-gray-600 mb-1 font-semibold">Địa chỉ đầy đủ (mới):</div>
            <div className="text-sm font-medium text-gray-800">
              {buildFullAddress(
                detailAddress,
                newWards.find(w => w.ward_code === newWardCode)?.name,
                undefined,
                newProvinces.find(p => p.province_code === newProvinceCode)?.name
              )}
            </div>
          </Card>

          {/* Show old address only if mode is 'old' and oldWardId is filled */}
          {mode === 'old' && oldWardId && (
            <Card size="small" className="bg-gray-100 border-gray-300">
              <div className="text-xs text-gray-600 mb-1 font-semibold">Địa chỉ đầy đủ (cũ):</div>
              <div className="text-sm font-medium text-gray-800">
                {buildFullAddress(
                  detailAddress,
                  oldWards.find(w => w.id === oldWardId)?.name,
                  oldDistricts.find(d => d.id === oldDistrictId)?.name,
                  oldProvinces.find(p => p.id === oldProvinceId)?.name
                )}
              </div>
            </Card>
          )}
        </div>
      )}
    </div>
  );
};

export default AddressSelector;
