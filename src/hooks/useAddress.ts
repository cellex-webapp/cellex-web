import { useState, useCallback } from 'react';
import { addressService } from '@/services/address.service';
// import { useDebounce } from './useDebounce';

/**
 * Hook for managing dual address system (before/after 07/2025)
 * Provides auto-sync between old and new address formats
 */
export const useAddress = () => {
  // Old address system data
  const [oldProvinces, setOldProvinces] = useState<IOldProvince[]>([]);
  const [oldDistricts, setOldDistricts] = useState<IOldDistrict[]>([]);
  const [oldWards, setOldWards] = useState<IOldWard[]>([]);

  // New address system data
  const [newProvinces, setNewProvinces] = useState<INewProvince[]>([]);
  const [newWards, setNewWards] = useState<INewWard[]>([]);

  // Loading states
  const [loadingOldProvinces, setLoadingOldProvinces] = useState(false);
  const [loadingOldDistricts, setLoadingOldDistricts] = useState(false);
  const [loadingOldWards, setLoadingOldWards] = useState(false);
  const [loadingNewProvinces, setLoadingNewProvinces] = useState(false);
  const [loadingNewWards, setLoadingNewWards] = useState(false);
  const [loadingMapping, setLoadingMapping] = useState(false);

  // Error states
  const [error, setError] = useState<string | null>(null);

  // ==================== Old Address System ====================

  const fetchOldProvinces = useCallback(async () => {
    setLoadingOldProvinces(true);
    setError(null);
    try {
      const response = await addressService.getOldProvinces();
      if (response.result) {
        setOldProvinces(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách tỉnh/thành phố (hệ thống cũ)');
      console.error('Error fetching old provinces:', err);
    } finally {
      setLoadingOldProvinces(false);
    }
  }, []);

  const fetchOldDistricts = useCallback(async (provinceId: string) => {
    if (!provinceId) {
      setOldDistricts([]);
      return;
    }
    setLoadingOldDistricts(true);
    setError(null);
    try {
      const response = await addressService.getOldDistrictsByProvince(provinceId);
      if (response.result) {
        setOldDistricts(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách quận/huyện');
      console.error('Error fetching old districts:', err);
    } finally {
      setLoadingOldDistricts(false);
    }
  }, []);

  const fetchOldWards = useCallback(async (districtId: string) => {
    if (!districtId) {
      setOldWards([]);
      return;
    }
    setLoadingOldWards(true);
    setError(null);
    try {
      const response = await addressService.getOldWardsByDistrict(districtId);
      if (response.result) {
        setOldWards(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách phường/xã');
      console.error('Error fetching old wards:', err);
    } finally {
      setLoadingOldWards(false);
    }
  }, []);

  // ==================== New Address System ====================

  const fetchNewProvinces = useCallback(async () => {
    setLoadingNewProvinces(true);
    setError(null);
    try {
      const response = await addressService.getNewProvinces();
      if (response.result) {
        setNewProvinces(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách tỉnh/thành phố (hệ thống mới)');
      console.error('Error fetching new provinces:', err);
    } finally {
      setLoadingNewProvinces(false);
    }
  }, []);

  const fetchNewWards = useCallback(async (provinceCode: string) => {
    if (!provinceCode) {
      setNewWards([]);
      return;
    }
    setLoadingNewWards(true);
    setError(null);
    try {
      const response = await addressService.getNewWardsByProvince(provinceCode);
      if (response.result) {
        setNewWards(response.result);
      }
    } catch (err) {
      setError('Không thể tải danh sách phường/xã');
      console.error('Error fetching new wards:', err);
    } finally {
      setLoadingNewWards(false);
    }
  }, []);

  // ==================== Ward Mapping ====================

  const mapWardCode = useCallback(async (
    wardCode: string, 
    codeType?: 'old' | 'new'
  ): Promise<IWardMappingResponse | null> => {
    if (!wardCode) return null;
    
    setLoadingMapping(true);
    setError(null);
    try {
      const response = await addressService.mapWardCode(wardCode, codeType);
      if (response.result) {
        return response.result;
      }
      return null;
    } catch (err) {
      console.error('Error mapping ward code:', err);
      return null;
    } finally {
      setLoadingMapping(false);
    }
  }, []);

  // ==================== Dual Address ====================

  const getDualAddress = useCallback(async (
    newWardCode: string, 
    detailAddress?: string
  ): Promise<IDualAddressResponse | null> => {
    if (!newWardCode) return null;
    
    setError(null);
    try {
      const response = await addressService.getDualAddress(newWardCode, detailAddress);
      if (response.result) {
        return response.result;
      }
      return null;
    } catch (err) {
      console.error('Error getting dual address:', err);
      return null;
    }
  }, []);

  // ==================== Utility Functions ====================

  const resetOldDistricts = useCallback(() => {
    setOldDistricts([]);
    setOldWards([]);
  }, []);

  const resetOldWards = useCallback(() => {
    setOldWards([]);
  }, []);

  const resetNewWards = useCallback(() => {
    setNewWards([]);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Find province/district/ward by ID
  const findOldProvinceById = useCallback((id: string) => 
    oldProvinces.find(p => p.id === id), [oldProvinces]);
  
  const findOldDistrictById = useCallback((id: string) => 
    oldDistricts.find(d => d.id === id), [oldDistricts]);
  
  const findOldWardById = useCallback((id: string) => 
    oldWards.find(w => w.id === id), [oldWards]);
  
  const findNewProvinceByCode = useCallback((code: string) => 
    newProvinces.find(p => p.province_code === code), [newProvinces]);
  
  const findNewWardByCode = useCallback((code: string) => 
    newWards.find(w => w.ward_code === code), [newWards]);

  return {
    // Data
    oldProvinces,
    oldDistricts,
    oldWards,
    newProvinces,
    newWards,

    // Loading states
    loadingOldProvinces,
    loadingOldDistricts,
    loadingOldWards,
    loadingNewProvinces,
    loadingNewWards,
    loadingMapping,

    // Error
    error,
    clearError,

    // Fetch functions
    fetchOldProvinces,
    fetchOldDistricts,
    fetchOldWards,
    fetchNewProvinces,
    fetchNewWards,

    // Reset functions
    resetOldDistricts,
    resetOldWards,
    resetNewWards,

    // Mapping functions
    mapWardCode,
    getDualAddress,

    // Find functions
    findOldProvinceById,
    findOldDistrictById,
    findOldWardById,
    findNewProvinceByCode,
    findNewWardByCode,
  };
};

export default useAddress;
