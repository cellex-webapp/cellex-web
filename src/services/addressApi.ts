import { api } from '@/utils/axiosInstance';
import type { Province, Commune } from '@/types/address.type';

export async function getProvinces(): Promise<Province[]> {
  return api.get<Province[]>('/address/provinces');
}

export async function getCommunesByProvince(provinceCode: string): Promise<Commune[]> {
  return api.get<Commune[]>(`/address/communes/${provinceCode}`);
}
