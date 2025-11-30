import axiosInstance from '@/utils/axiosInstance';
import toFormData from '@/utils/formData';

export const notificationService = {
  getUserNotifications: async (page?: number, size?: number): Promise<IApiResponse<NotificationListResponse>> => {
    const resp = await axiosInstance.get<IApiResponse<NotificationListResponse>>('/notifications', {
      params: { page, size },
    });
    return resp.data;
  },
  getUnreadCount: async (): Promise<IApiResponse<Record<string, number>>> => {
    const resp = await axiosInstance.get<IApiResponse<Record<string, number>>>('/notifications/unread-count');
    return resp.data;
  },
  markAsRead: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.put<IApiResponse<void>>(`/notifications/${id}/read`);
    return resp.data;
  },
  markAllAsRead: async (): Promise<IApiResponse<Record<string, number>>> => {
    const resp = await axiosInstance.put<IApiResponse<Record<string, number>>>('/notifications/read-all');
    return resp.data;
  },
  registerDeviceToken: async (body: DeviceTokenRequest): Promise<IApiResponse<Record<string, string>>> => {
    const resp = await axiosInstance.post<IApiResponse<Record<string, string>>>('/notifications/device-token', body, {
      headers: { 'Content-Type': 'application/json' },
    });
    console.log('🔍 Response:', resp.data);
    return resp.data;
  },
  unregisterDeviceToken: async (fcmToken: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/notifications/device-token/${encodeURIComponent(fcmToken)}`);
    return resp.data;
  },
  sendBroadcastNotification: async (payload: BroadcastNotificationRequest): Promise<IApiResponse<void>> => {
    const fd = toFormData({
      title: payload.title,
      message: payload.message,
      type: payload.type,
      metadata: payload.metadata,
      actionUrl: payload.actionUrl,
      expiresAt: payload.expiresAt,
      imageFile: payload.imageFile,
    });
    const resp = await axiosInstance.post<IApiResponse<void>>('/notifications/broadcast', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return resp.data;
  },
  sendTestNotification: async (): Promise<IApiResponse<Record<string, string>>> => {
    const resp = await axiosInstance.post<IApiResponse<Record<string, string>>>('/notifications/debug/test-notification');
    return resp.data;
  },
  sendTestBroadcast: async (): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.post<IApiResponse<void>>('/notifications/debug/test-broadcast');
    return resp.data;
  },
  deleteNotification: async (id: string): Promise<IApiResponse<void>> => {
    const resp = await axiosInstance.delete<IApiResponse<void>>(`/notifications/${id}`);
    return resp.data;
  },
  getMyDevices: async (): Promise<IApiResponse<Record<string, unknown>>> => {
    const resp = await axiosInstance.get<IApiResponse<Record<string, unknown>>>('/notifications/debug/my-devices');
    return resp.data;
  },
  getAllDevices: async (): Promise<IApiResponse<Record<string, unknown>>> => {
    const resp = await axiosInstance.get<IApiResponse<Record<string, unknown>>>('/notifications/debug/all-devices');
    return resp.data;
  },
  checkFirebaseStatus: async (): Promise<IApiResponse<Record<string, unknown>>> => {
    const resp = await axiosInstance.get<IApiResponse<Record<string, unknown>>>('/notifications/debug/firebase-status');
    return resp.data;
  },
};

export default notificationService;