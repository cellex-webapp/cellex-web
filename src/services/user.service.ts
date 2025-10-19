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
    const resp = await axiosInstance.put<IApiResponse<IUser>>('/users/profile', data);
    return (resp as unknown) as IApiResponse<IUser>;
  },
  addUserAccount: async (data: IAddAccountPayload): Promise<IApiResponse<IUser>> => {
    const resp = await axiosInstance.post<IApiResponse<IUser>>('/users/add-account', data);
    return (resp as unknown) as IApiResponse<IUser>;
  },
};