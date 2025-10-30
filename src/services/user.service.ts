import axiosInstance from '@/utils/axiosInstance';

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
    const form = new FormData();

    if (data.fullName) {
      form.append('fullName', data.fullName);
    }
    if (data.phoneNumber) {
      form.append('phoneNumber', data.phoneNumber);
    }
    if (data.provinceCode) {
      form.append('provinceCode', data.provinceCode);
    }
    if (data.communeCode) {
      form.append('communeCode', data.communeCode);
    }
    if (data.detailAddress) {
      form.append('detailAddress', data.detailAddress);
    }

    const avatarVal = (data as any).avatar;
    if (avatarVal && typeof avatarVal !== 'string') {
      const file = avatarVal as File;
      try {
        form.append('avatar', file, file.name || 'avatar');
      } catch (e) {
        form.append('avatar', file as any);
      }
    }

    const resp = await axiosInstance.put<IApiResponse<IUser>>('/users/me', form);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  addUserAccount: async (data: IAddAccountPayload): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.post<IApiResponse<IUser>>('/users/add-account', data);
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