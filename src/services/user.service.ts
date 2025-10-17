import axiosInstance from '@/utils/axiosInstance';

export const userService = {
  getAllUsers: () => axiosInstance.get('/users'),
  getUserById: (userId: string) => axiosInstance.get(`/users/${userId}`),
  getCurrentUserProfile: () => axiosInstance.get('/users/me'),
  updateUserProfile: (data: IUpdateProfilePayload) =>
    axiosInstance.put('/users/profile', data),
  addUserAccount: (data: IAddAccountPayload) =>
    axiosInstance.post('/users/add-account', data),
};