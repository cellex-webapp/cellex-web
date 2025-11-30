import axiosInstance from '@/utils/axiosInstance';
import toFormData, { isFormData } from '@/utils/formData';

export const userService = {
  getAllUsers: async (params?: IPaginationParams) => {
    const response = await axiosInstance.get<IApiResponse<IPaginatedResult<IUser>>>('/users', { params });
    return response.data;
  },
  
  getUserById: async (userId: string) => {
    const response = await axiosInstance.get<IApiResponse<IUser>>(`/users/${userId}`);
    return response.data;
  },
  
  getCurrentUserProfile: async () => {
    const response = await axiosInstance.get<IApiResponse<IUser>>('/users/me');
    return response.data;
  },
  getMyProfile: async () => {
    return userService.getCurrentUserProfile();
  },

  updateUserProfile: async (data: IUpdateProfilePayload) => {
    const payload: Record<string, any> = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      provinceCode: data.provinceCode,
      communeCode: data.communeCode,
      detailAddress: data.detailAddress,
    };

    if (data.avatar instanceof File) {
      payload.avatar = data.avatar;
    }

    const form = toFormData(payload);
    const response = await axiosInstance.put<IApiResponse<IUser>>('/users/me', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  addUserAccount: async (data: IAddAccountPayload) => {
    const form = isFormData(data) ? data : toFormData(data as Record<string, any>);
    const response = await axiosInstance.post<IApiResponse<IUser>>('/users/add-account', form, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  },

  banUser: async (userId: string, payload?: { banReason?: string }) => {
    const response = await axiosInstance.post<IApiResponse<IUser>>(`/users/${userId}/ban`, payload ?? {});
    return response.data;
  },

  unbanUser: async (userId: string) => {
    const response = await axiosInstance.post<IApiResponse<IUser>>(`/users/${userId}/unban`);
    return response.data;
  },
};