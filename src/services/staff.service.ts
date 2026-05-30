import axiosInstance from '@/utils/axiosInstance';

export const staffService = {
  getPermissionKeys: async (): Promise<IApiResponse<string[]>> => {
    const resp = await axiosInstance.get<IApiResponse<string[]>>('/vendor/shop-roles/permissions');
    return resp.data;
  },
  getRoles: async (): Promise<IApiResponse<any[]>> => {
    const resp = await axiosInstance.get<IApiResponse<any[]>>('/vendor/shop-roles');
    return resp.data;
  },
  createRole: async (body: { name: string; description?: string; permissions: string[] }): Promise<IApiResponse<any>> => {
    const resp = await axiosInstance.post<IApiResponse<any>>('/vendor/shop-roles', body);
    return resp.data;
  },
  updateRole: async (id: string, body: { name?: string; description?: string; permissions?: string[] }): Promise<IApiResponse<any>> => {
    const resp = await axiosInstance.put<IApiResponse<any>>(`/vendor/shop-roles/${id}`, body);
    return resp.data;
  },
  deleteRole: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/vendor/shop-roles/${id}`);
    return resp.data;
  },
  searchUsers: async (keyword: string): Promise<IApiResponse<any[]>> => {
    const resp = await axiosInstance.get<IApiResponse<any[]>>('/vendor/staff/search', { params: { keyword } });
    return resp.data;
  },
  invite: async (body: { userId: string; shopRoleId: string }): Promise<IApiResponse<any>> => {
    const resp = await axiosInstance.post<IApiResponse<any>>('/vendor/staff/invite', body);
    return resp.data;
  },
  getSentInvitations: async (): Promise<IApiResponse<any[]>> => {
    const resp = await axiosInstance.get<IApiResponse<any[]>>('/vendor/staff/invitations');
    return resp.data;
  },
  revokeInvitation: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/vendor/staff/invitations/${id}`);
    return resp.data;
  },
  getMembers: async (): Promise<IApiResponse<any[]>> => {
    const resp = await axiosInstance.get<IApiResponse<any[]>>('/vendor/staff');
    return resp.data;
  },
  updateMemberRole: async (userId: string, shopRoleId: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.put<IApiResponse<void>>(`/vendor/staff/${userId}/role`, { shopRoleId });
    return resp.data;
  },
  removeMember: async (userId: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/vendor/staff/${userId}`);
    return resp.data;
  },
  getMyShop: async (): Promise<IApiResponse<{ shopId: string; permissions: string[]; shopName?: string; roleName?: string }>> => {
    const resp = await axiosInstance.get<IApiResponse<any>>('/staff/my-shop');
    return resp.data;
  },
  getInvitations: async (): Promise<IApiResponse<any[]>> => {
    const resp = await axiosInstance.get<IApiResponse<any[]>>('/staff/invitations');
    return resp.data;
  },
  acceptInvitation: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>(`/staff/invitations/${id}/accept`);
    return resp.data;
  },
  declineInvitation: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>(`/staff/invitations/${id}/decline`);
    return resp.data;
  },
  leaveShop: async (shopId: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>('/staff/leave', { shopId });
    return resp.data;
  }
};

