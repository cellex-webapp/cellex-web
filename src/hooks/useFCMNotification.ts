import { useEffect, useState, useCallback } from 'react';
import { notification } from 'antd';
import { 
  requestNotificationPermission, 
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission 
} from '@/config/firebase';
import notificationService from '@/services/notification.service';

/**
 * Get user agent info for device name
 */
const getUserAgentInfo = (): string => {
  const ua = navigator.userAgent;
  
  // Detect browser
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  // Detect OS
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

export const useFCMNotification = () => {
  const [fcmToken, setFcmToken] = useState<string | null>(null);
  const [permissionStatus, setPermissionStatus] = useState<NotificationPermission>('default');
  const [isLoading, setIsLoading] = useState(false);

  // Initialize - check permission status
  useEffect(() => {
    if (isNotificationSupported()) {
      setPermissionStatus(getNotificationPermission());
      
      // Load saved token from localStorage
      const savedToken = localStorage.getItem('fcmToken');
      if (savedToken) {
        setFcmToken(savedToken);
      }
    }
  }, []);

  // Listen for foreground messages
  useEffect(() => {
    const unsubscribe = onForegroundMessage((payload) => {
      console.log('Notification received while app is open:', payload);
      
      // Show in-app notification
      notification.info({
        message: payload.notification?.title || 'Thông báo mới',
        description: payload.notification?.body || '',
        placement: 'topRight',
        duration: 5,
        onClick: () => {
          // Navigate to action URL if provided
          if (payload.data?.actionUrl) {
            window.location.href = payload.data.actionUrl;
          }
        },
      });
    });

    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, []);

  /**
   * Enable push notifications
   */
  const enableNotifications = useCallback(async () => {
    if (!isNotificationSupported()) {
      notification.error({
        message: 'Không hỗ trợ',
        description: 'Trình duyệt của bạn không hỗ trợ push notification',
      });
      return;
    }

    setIsLoading(true);

    try {
      // Step 1: Request permission and get FCM token
      const token = await requestNotificationPermission();
      
      if (!token) {
        notification.warning({
          message: 'Không thể bật thông báo',
          description: 'Vui lòng cho phép thông báo trong cài đặt trình duyệt',
        });
        return;
      }

      // Step 2: Save token to state and localStorage
      setFcmToken(token);
      localStorage.setItem('fcmToken', token);
      setPermissionStatus('granted');

      // Step 3: Register token with backend
      const response = await notificationService.registerDeviceToken({
        fcmToken: token,
        deviceType: 'WEB',
        deviceName: getUserAgentInfo(),
      });
      
      if (response.code === 1000) {
        notification.success({
          message: 'Đã bật thông báo',
          description: 'Bạn sẽ nhận được thông báo từ hệ thống',
        });
        
        console.log('Device registered with ID:', response.result?.deviceId);
      }
    } catch (error: any) {
      console.error('Failed to enable notifications:', error);
      
      notification.error({
        message: 'Lỗi',
        description: error.response?.data?.message || 'Không thể bật thông báo',
      });
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Disable push notifications
   */
  const disableNotifications = useCallback(async () => {
    if (!fcmToken) return;

    setIsLoading(true);

    try {
      // Unregister from backend
      await notificationService.unregisterDeviceToken(fcmToken);
      
      // Clear local state
      setFcmToken(null);
      localStorage.removeItem('fcmToken');
      
      notification.success({
        message: 'Đã tắt thông báo',
        description: 'Bạn sẽ không nhận được thông báo nữa',
      });
    } catch (error) {
      console.error('Failed to disable notifications:', error);
      
      notification.error({
        message: 'Lỗi',
        description: 'Không thể tắt thông báo',
      });
    } finally {
      setIsLoading(false);
    }
  }, [fcmToken]);

  return {
    fcmToken,
    permissionStatus,
    isLoading,
    isSupported: isNotificationSupported(),
    enableNotifications,
    disableNotifications,
  };
};
