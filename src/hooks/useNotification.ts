import { useAppDispatch, useAppSelector } from '@/hooks/redux';
import { useCallback } from 'react';
import {
  fetchNotifications,
  fetchUnreadCount,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
  registerDeviceToken,
  unregisterDeviceToken,
  sendBroadcastNotification,
  sendTestNotification,
  sendTestBroadcast,
} from '@/stores/slices/notification.slice';
import {
  selectNotifications,
  selectNotificationPageMeta,
  selectUnreadCount,
  selectNotificationIsLoading,
  selectNotificationError,
} from '@/stores/selectors/notification.selector';

export const useNotification = () => {
  const dispatch = useAppDispatch();

  const notifications = useAppSelector(selectNotifications);
  const meta = useAppSelector(selectNotificationPageMeta);
  const unreadCount = useAppSelector(selectUnreadCount);
  const isLoading = useAppSelector(selectNotificationIsLoading);
  const error = useAppSelector(selectNotificationError);

  const fetchAll = useCallback((page?: number, size?: number) => dispatch(fetchNotifications({ page, size })), [dispatch]);
  const refreshUnread = useCallback(() => dispatch(fetchUnreadCount()), [dispatch]);
  const markAsRead = useCallback((id: string) => dispatch(markNotificationRead(id)), [dispatch]);
  const markAllAsRead = useCallback(() => dispatch(markAllNotificationsRead()), [dispatch]);
  const remove = useCallback((id: string) => dispatch(deleteNotification(id)), [dispatch]);
  const registerToken = useCallback((payload: DeviceTokenRequest) => dispatch(registerDeviceToken(payload)), [dispatch]);
  const unregisterToken = useCallback((token: string) => dispatch(unregisterDeviceToken(token)), [dispatch]);
  const broadcast = useCallback((payload: BroadcastNotificationRequest) => dispatch(sendBroadcastNotification(payload)), [dispatch]);
  const testNotification = useCallback(() => dispatch(sendTestNotification()), [dispatch]);
  const testBroadcast = useCallback(() => dispatch(sendTestBroadcast()), [dispatch]);

  return {
    notifications,
    meta,
    unreadCount,
    isLoading,
    error,
    fetchNotifications: fetchAll,
    getUnreadCount: refreshUnread,
    markAsRead,
    markAllAsRead,
    deleteNotification: remove,
    registerDeviceToken: registerToken,
    unregisterDeviceToken: unregisterToken,
    sendBroadcast: broadcast,
    sendTestNotification: testNotification,
    sendTestBroadcast: testBroadcast,
  };
};
