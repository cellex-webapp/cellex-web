import axiosInstance from '@/utils/axiosInstance';
import toFormData, { isFormData } from '@/utils/formData';

export const userService = {
  getAllUsers: async (): Promise<IApiResponse<IUser[]>> => {
    const resp = await axiosInstance.get<IApiResponse<IUser[]>>('/users');
    return (resp as unknown) as IApiResponse<IUser[]>;
  },
  getUserById: async (userId: string): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.get<IApiResponse<IUser>>(`/users/${userId}`);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  getCurrentUserProfile: async (): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.get<IApiResponse<IUser>>('/users/me');
    return (resp as unknown) as IApiResponse<IUser>;
  },
  updateUserProfile: async (data: IUpdateProfilePayload): Promise<IApiResponse<IUser>> => {
    const payload: Record<string, any> = {
      fullName: data.fullName,
      phoneNumber: data.phoneNumber,
      provinceCode: data.provinceCode,
      communeCode: data.communeCode,
      detailAddress: data.detailAddress,
    };

    if (data.avatar && data.avatar instanceof File) {
      payload.avatar = data.avatar;
    }

    const form = toFormData(payload);

    const resp = await axiosInstance.put<IApiResponse<IUser>>('/users/me', form);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  addUserAccount: async (data: IAddAccountPayload): Promise<IApiResponse<IUser>> => {
    const form = isFormData(data) ? data : toFormData(data as Record<string, any>);
    const resp = await axiosInstance.post<IApiResponse<IUser>>('/users/add-account', form);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  banUser: async (
    userId: string,
    payload?: { banReason?: string }
  ): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.post<IApiResponse<IUser>>(`/users/${userId}/ban`, payload ?? {});
    return (resp as unknown) as IApiResponse<IUser>;
  },
  unbanUser: async (userId: string): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.post<IApiResponse<IUser>>(`/users/${userId}/unban`);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  getMyProfile: async (): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.get<IApiResponse<IUser>>('/users/me');
    return (resp as unknown) as IApiResponse<IUser>;
  }
};