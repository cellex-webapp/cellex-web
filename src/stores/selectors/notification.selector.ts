import type { RootState } from '@/stores/store';

export const selectNotificationState = (state: RootState) => state.notification;
export const selectNotifications = (state: RootState) => state.notification.notifications;
export const selectUnreadCount = (state: RootState) => state.notification.unreadCount;
export const selectNotificationIsLoading = (state: RootState) => state.notification.isLoading;
export const selectNotificationError = (state: RootState) => state.notification.error;
export const selectNotificationPageMeta = (state: RootState) => ({
  page: state.notification.page,
  size: state.notification.size,
  totalPages: state.notification.totalPages,
  totalElements: state.notification.totalElements,
});
