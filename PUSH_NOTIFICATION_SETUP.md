# Hướng dẫn Setup Push Notification cho Frontend (React/Vite)

## Tổng quan

Tài liệu này hướng dẫn chi tiết cách tích hợp Firebase Cloud Messaging (FCM) vào web app React/Vite để nhận push notification từ backend.

### Kiến trúc hệ thống

```
┌─────────────────┐         ┌──────────────────┐         ┌─────────────────┐
│   React Web     │────────>│  Backend API     │────────>│ Firebase Cloud  │
│   (cellex-web)  │ Register│  (Spring Boot)   │  Send   │   Messaging     │
│                 │<────────│                  │<────────│                 │
│  - Get FCM Token│  Token  │  - Store tokens  │ Response│  - Push to      │
│  - Listen msgs  │         │  - Send push     │         │    devices      │
└─────────────────┘         └──────────────────┘         └─────────────────┘
```

### Luồng hoạt động

1. **User mở web** → Request notification permission
2. **Browser cấp quyền** → Lấy FCM token từ Firebase
3. **Web gửi token** → Backend API `/api/v1/notifications/device-token`
4. **Backend lưu token** → Vào database (collection `user_devices`)
5. **Khi có sự kiện** → Backend gọi FCM API
6. **FCM gửi notification** → Đến browser của user
7. **Service Worker** → Hiển thị notification (background)
8. **onMessage listener** → Hiển thị notification (foreground)

---

## Phần 1: Cấu hình Firebase Console

### Bước 1.1: Đăng ký Web App

1. Truy cập [Firebase Console](https://console.firebase.google.com)
2. Chọn project hiện tại (project trong file `firebase-service-account.json`)
3. Vào **Project Settings** (⚙️ icon) → Tab **General**
4. Cuộn xuống phần **Your apps**
5. Click **Add app** → Chọn icon **Web** (`</>`)
6. Điền thông tin:
   - **App nickname**: `cellex-web`
   - **KHÔNG** tick "Also set up Firebase Hosting"
7. Click **Register app**
8. **Copy đoạn config** hiển thị ra:

```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123"
};
```

9. Click **Continue to console**

### Bước 1.2: Tạo VAPID Key (Web Push Certificate)

1. Vẫn trong **Project Settings** → Chuyển sang tab **Cloud Messaging**
2. Cuộn xuống phần **Web configuration**
3. Tìm **Web Push certificates**
4. Click **Generate key pair**
5. **Copy Key pair** (VAPID public key) - chuỗi bắt đầu bằng `B...` (dài ~88 ký tự)

> ⚠️ **Lưu ý**: Key này dùng để xác thực web app với FCM server

---

## Phần 2: Setup Frontend Code

### Bước 2.1: Cài đặt Dependencies

Chạy trong thư mục `cellex-web`:

```bash
npm install firebase
```

### Bước 2.2: Tạo Environment Variables

Tạo file `.env` (hoặc `.env.local`) trong thư mục gốc:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc123
VITE_FIREBASE_VAPID_KEY=BNxxxxx...

# Backend API URL
VITE_API_BASE_URL=http://localhost:8080
```

> 📝 Thay thế các giá trị bằng config thực tế từ Bước 1.1 và 1.2

### Bước 2.3: Tạo Firebase Config

Tạo file `src/config/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, Messaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

// Initialize Firebase App
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging
let messaging: Messaging | null = null;

// Check if browser supports notifications
if (typeof window !== 'undefined' && 'Notification' in window) {
  try {
    messaging = getMessaging(app);
  } catch (error) {
    console.error('Error initializing Firebase Messaging:', error);
  }
}

export { messaging };

// VAPID Key (Web Push Certificate)
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY;

/**
 * Request notification permission and get FCM token
 * @returns FCM token string or null if failed
 */
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    if (!messaging) {
      console.warn('Firebase Messaging is not supported in this browser');
      return null;
    }

    // Check if service worker is ready
    if (!('serviceWorker' in navigator)) {
      console.warn('Service Worker is not supported');
      return null;
    }

    // Request notification permission
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      console.log('Notification permission granted');
      
      // Get FCM token
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      
      if (token) {
        console.log('FCM Token obtained:', token);
        return token;
      } else {
        console.warn('No FCM token available');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('Notification permission denied');
      return null;
    } else {
      console.warn('Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
};

/**
 * Listen for foreground messages (when app is open)
 * @param callback Function to handle incoming message
 */
export const onForegroundMessage = (callback: (payload: any) => void) => {
  if (!messaging) {
    console.warn('Messaging is not initialized');
    return;
  }
  
  return onMessage(messaging, (payload) => {
    console.log('📩 Foreground message received:', payload);
    callback(payload);
  });
};

/**
 * Check if notifications are supported
 */
export const isNotificationSupported = (): boolean => {
  return 'Notification' in window && 'serviceWorker' in navigator;
};

/**
 * Get current notification permission status
 */
export const getNotificationPermission = (): NotificationPermission => {
  if ('Notification' in window) {
    return Notification.permission;
  }
  return 'default';
};
```

### Bước 2.4: Tạo Service Worker

Tạo file `public/firebase-messaging-sw.js`:

```javascript
// Firebase Cloud Messaging Service Worker
// File này xử lý push notifications khi app ở background

// Import Firebase scripts từ CDN
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

// ⚠️ Firebase config phải hardcode vì Service Worker không access được import.meta.env
// Thay thế bằng config thực tế từ Firebase Console
firebase.initializeApp({
  apiKey: "AIzaSy...",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abc123",
});

const messaging = firebase.messaging();

// Handle background messages (khi app không mở hoặc minimize)
messaging.onBackgroundMessage((payload) => {
  console.log('📩 Background message received:', payload);

  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || '',
    icon: payload.notification?.icon || '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: payload.notification?.image,
    data: payload.data,
    requireInteraction: true,
    tag: payload.data?.type || 'default',
    vibrate: [200, 100, 200],
  };

  // Hiển thị notification
  return self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notification clicked:', event.notification);
  
  event.notification.close();

  // Lấy URL từ data hoặc dùng default
  const actionUrl = event.notification.data?.actionUrl || '/';
  const fullUrl = self.location.origin + actionUrl;
  
  event.waitUntil(
    clients.matchAll({ 
      type: 'window', 
      includeUncontrolled: true 
    }).then((clientList) => {
      // Nếu app đã mở, focus vào tab đó
      for (const client of clientList) {
        if (client.url === fullUrl && 'focus' in client) {
          return client.focus();
        }
      }
      // Nếu không, mở tab mới
      if (clients.openWindow) {
        return clients.openWindow(fullUrl);
      }
    })
  );
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('Notification closed:', event.notification);
});
```

### Bước 2.5: Tạo Service để gọi Backend API

Tạo file `src/services/notificationService.ts`:

```typescript
import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080';

export interface DeviceTokenRequest {
  fcmToken: string;
  deviceType: 'WEB' | 'ANDROID' | 'IOS';
  deviceName: string;
}

export interface DeviceTokenResponse {
  code: number;
  message: string;
  result: {
    deviceId: string;
  };
}

/**
 * Register FCM token with backend
 */
export const registerDeviceToken = async (
  fcmToken: string
): Promise<DeviceTokenResponse> => {
  const token = localStorage.getItem('token'); // Hoặc lấy từ Redux store
  
  const deviceInfo: DeviceTokenRequest = {
    fcmToken,
    deviceType: 'WEB',
    deviceName: getUserAgentInfo(),
  };

  const response = await axios.post<DeviceTokenResponse>(
    `${API_BASE_URL}/api/v1/notifications/device-token`,
    deviceInfo,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );

  return response.data;
};

/**
 * Unregister FCM token from backend
 */
export const unregisterDeviceToken = async (fcmToken: string): Promise<void> => {
  const token = localStorage.getItem('token');

  await axios.delete(
    `${API_BASE_URL}/api/v1/notifications/device-token/${fcmToken}`,
    {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    }
  );
};

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
```

### Bước 2.6: Tạo Custom Hook

Tạo file `src/hooks/useNotification.ts`:

```typescript
import { useEffect, useState, useCallback } from 'react';
import { notification } from 'antd';
import { 
  requestNotificationPermission, 
  onForegroundMessage,
  isNotificationSupported,
  getNotificationPermission 
} from '../config/firebase';
import { registerDeviceToken, unregisterDeviceToken } from '../services/notificationService';

export const useNotification = () => {
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
      const response = await registerDeviceToken(token);
      
      if (response.code === 1000) {
        notification.success({
          message: 'Đã bật thông báo',
          description: 'Bạn sẽ nhận được thông báo từ hệ thống',
        });
        
        console.log('Device registered with ID:', response.result.deviceId);
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
      await unregisterDeviceToken(fcmToken);
      
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
```

### Bước 2.7: Tích hợp vào App Component

Ví dụ trong `App.tsx`:

```typescript
import { useEffect } from 'react';
import { Button, Badge } from 'antd';
import { BellOutlined, BellFilled } from '@ant-design/icons';
import { useNotification } from './hooks/useNotification';

function App() {
  const { 
    fcmToken, 
    permissionStatus, 
    isLoading,
    isSupported,
    enableNotifications,
    disableNotifications 
  } = useNotification();

  // Auto-enable notifications for logged-in users
  useEffect(() => {
    const isLoggedIn = !!localStorage.getItem('token');
    
    if (isLoggedIn && isSupported && permissionStatus === 'default') {
      // Optionally auto-request permission
      // enableNotifications();
    }
  }, [isSupported, permissionStatus]);

  return (
    <div className="app">
      {/* Notification toggle button */}
      {isSupported && (
        <div className="notification-control">
          {permissionStatus === 'granted' && fcmToken ? (
            <Badge dot>
              <Button 
                type="text"
                icon={<BellFilled style={{ color: '#1890ff' }} />}
                loading={isLoading}
                onClick={disableNotifications}
                title="Tắt thông báo"
              />
            </Badge>
          ) : (
            <Button 
              type="text"
              icon={<BellOutlined />}
              loading={isLoading}
              onClick={enableNotifications}
              title="Bật thông báo"
            />
          )}
        </div>
      )}

      {/* Rest of your app */}
      {/* ... */}
    </div>
  );
}

export default App;
```

### Bước 2.8: Thêm Notification Icons

Thêm các file icon vào thư mục `public/`:

1. **icon-192x192.png** - Icon chính (192x192px)
2. **badge-72x72.png** - Badge icon (72x72px)

Bạn có thể tạo icons từ logo app hoặc dùng tool như [RealFaviconGenerator](https://realfavicongenerator.net/).

### Bước 2.9: Cập nhật vite.config.ts (Optional)

Đảm bảo Service Worker được copy vào build output:

```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react-swc';

export default defineConfig({
  plugins: [react()],
  publicDir: 'public', // Service Worker sẽ được copy tự động
});
```

---

## Phần 3: Cách hoạt động của FCM Token

### 3.1: FCM Token là gì?

- **FCM Token** (Registration Token) là một chuỗi unique identifier
- Được Firebase tạo ra cho mỗi **browser instance**
- Dùng để định danh thiết bị khi gửi push notification
- Ví dụ token: `dGhpcy1pcy1hLWZha2UtdG9rZW4tZm9yLWRlbW9uc3RyYXRpb24...`

### 3.2: Quy trình lấy và truyền FCM Token

```
┌──────────────────────────────────────────────────────────────────┐
│ 1. User click "Bật thông báo"                                     │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 2. Call requestNotificationPermission()                           │
│    - Notification.requestPermission()                             │
│    - Browser hiện popup xin quyền                                 │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 3. User click "Allow"                                             │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 4. getToken(messaging, { vapidKey })                              │
│    - Firebase SDK kết nối FCM server                              │
│    - FCM server tạo unique token                                  │
│    - Return token về client                                       │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 5. Lưu token vào state & localStorage                             │
│    setFcmToken(token)                                             │
│    localStorage.setItem('fcmToken', token)                        │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 6. Gửi token đến Backend API                                      │
│    POST /api/v1/notifications/device-token                        │
│    Body: {                                                        │
│      "fcmToken": "dGhpcy1pcy1h...",                               │
│      "deviceType": "WEB",                                         │
│      "deviceName": "Chrome on Windows"                            │
│    }                                                              │
│    Headers: {                                                     │
│      "Authorization": "Bearer <JWT_TOKEN>"                        │
│    }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 7. Backend lưu vào database                                       │
│    Collection: user_devices                                       │
│    Document: {                                                    │
│      id: "device-uuid",                                           │
│      userId: "user-123",                                          │
│      fcmToken: "dGhpcy1pcy1h...",                                 │
│      deviceType: "WEB",                                           │
│      deviceName: "Chrome on Windows",                             │
│      isActive: true,                                              │
│      createdAt: "2025-11-30T10:00:00"                             │
│    }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 8. Backend return deviceId                                        │
│    Response: {                                                    │
│      "code": 1000,                                                │
│      "message": "Device token registered successfully",           │
│      "result": { "deviceId": "device-uuid" }                      │
│    }                                                              │
└────────────────────────┬─────────────────────────────────────────┘
                         ▼
┌──────────────────────────────────────────────────────────────────┐
│ 9. ✅ Hoàn tất - User có thể nhận push notification                │
└──────────────────────────────────────────────────────────────────┘
```

### 3.3: Code chi tiết lấy FCM Token

```typescript
// Trong src/config/firebase.ts
export const requestNotificationPermission = async (): Promise<string | null> => {
  try {
    // Bước 1: Request permission từ browser
    const permission = await Notification.requestPermission();
    
    if (permission === 'granted') {
      // Bước 2: Lấy FCM token
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,  // ✅ VAPID key từ Firebase Console
        serviceWorkerRegistration: await navigator.serviceWorker.ready
      });
      
      // Bước 3: Return token
      return token; // ✅ Đây là FCM token cần gửi đến backend
    }
    
    return null;
  } catch (error) {
    console.error('Error:', error);
    return null;
  }
};
```

### 3.4: Code chi tiết gửi Token đến Backend

```typescript
// Trong src/hooks/useNotification.ts
const enableNotifications = async () => {
  // 1. Lấy FCM token
  const token = await requestNotificationPermission();
  
  if (token) {
    // 2. Lưu vào localStorage
    localStorage.setItem('fcmToken', token);
    
    // 3. Gửi đến backend
    const response = await registerDeviceToken(token);
    
    // 4. Xử lý response
    if (response.code === 1000) {
      console.log('✅ Token đã được đăng ký với backend');
    }
  }
};
```

```typescript
// Trong src/services/notificationService.ts
export const registerDeviceToken = async (fcmToken: string) => {
  const jwtToken = localStorage.getItem('token'); // ✅ JWT token để authenticate
  
  const response = await axios.post(
    'http://localhost:8080/api/v1/notifications/device-token',
    {
      fcmToken,              // ✅ FCM token từ Firebase
      deviceType: 'WEB',     // ✅ Loại thiết bị
      deviceName: getUserAgentInfo() // ✅ Tên thiết bị
    },
    {
      headers: {
        'Authorization': `Bearer ${jwtToken}`, // ✅ JWT để authenticate
        'Content-Type': 'application/json'
      }
    }
  );
  
  return response.data;
};
```

### 3.5: Token Lifecycle & Refresh

FCM token có thể thay đổi trong các trường hợp:
- User xóa cache/cookies
- User reinstall browser
- Token expire (hiếm khi xảy ra)

Để xử lý token refresh:

```typescript
import { onTokenRefresh } from 'firebase/messaging';

// Listen for token refresh
onTokenRefresh(messaging, async (newToken) => {
  console.log('🔄 FCM Token refreshed:', newToken);
  
  // Update localStorage
  localStorage.setItem('fcmToken', newToken);
  
  // Re-register with backend
  await registerDeviceToken(newToken);
});
```

---

## Phần 4: Testing

### 4.1: Test trên Development

1. Chạy frontend:
   ```bash
   npm run dev
   ```

2. Chạy backend:
   ```bash
   cd backend/cellex
   mvn spring-boot:run
   ```

3. Mở browser: `http://localhost:5173`

4. Click nút "Bật thông báo"

5. Check console logs:
   ```
   ✅ Notification permission granted
   ✅ FCM Token obtained: dGhpcy1pcy1h...
   ✅ Device registered with ID: device-uuid
   ```

### 4.2: Test gửi notification từ Backend

Dùng Postman/Thunder Client gửi request:

**Endpoint:** `POST http://localhost:8080/api/v1/notifications/broadcast`

**Headers:**
```
Authorization: Bearer <ADMIN_JWT_TOKEN>
Content-Type: multipart/form-data
```

**Body (form-data):**
```
title: "Test Notification"
message: "This is a test push notification"
type: "SYSTEM"
```

**Expected result:**
- Browser hiện notification (nếu app đang mở)
- Service Worker hiện notification (nếu app minimize)

### 4.3: Debug Issues

Nếu không nhận được notification:

1. **Check Firebase Config:**
   ```javascript
   console.log('Project ID:', messaging.app.options.projectId);
   ```

2. **Check Service Worker:**
   - Mở DevTools → Application → Service Workers
   - Kiểm tra `firebase-messaging-sw.js` đã register chưa

3. **Check Notification Permission:**
   ```javascript
   console.log('Permission:', Notification.permission);
   ```

4. **Check FCM Token:**
   ```javascript
   console.log('FCM Token:', localStorage.getItem('fcmToken'));
   ```

5. **Check Backend Logs:**
   ```
   📤 Sending FCM notification to 1 token(s)
   📊 FCM Result: Successfully sent 1 notifications, 0 failures
   ```

---

## Phần 5: Deploy to Production

### 5.1: HTTPS Requirement

⚠️ **Push notification chỉ hoạt động trên HTTPS** (localhost là ngoại lệ)

Cách deploy:
- Vercel/Netlify (tự động có SSL)
- Custom domain + Let's Encrypt
- Cloudflare (free SSL)

### 5.2: Update Environment Variables

Trên hosting platform, set environment variables:

```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
VITE_API_BASE_URL=https://api.yourdomain.com
```

### 5.3: Update Service Worker Config

Trong `public/firebase-messaging-sw.js`, thay hardcoded config bằng config production.

### 5.4: Build & Deploy

```bash
# Build
npm run build

# Deploy (ví dụ với Vercel)
vercel --prod
```

---

## Phần 6: Best Practices

### 6.1: Security

✅ **DO:**
- Luôn validate JWT token trước khi register FCM token
- Lưu FCM token trong localStorage (không phải sessionStorage)
- Xóa token khi user logout

❌ **DON'T:**
- Không hardcode Firebase config trong code
- Không share VAPID key publicly
- Không lưu sensitive data trong notification payload

### 6.2: UX Best Practices

✅ **DO:**
- Hỏi permission vào thời điểm phù hợp (sau khi user login)
- Giải thích lợi ích của notification trước khi request
- Cho phép user tắt notification dễ dàng
- Hiển thị badge/icon để user biết trạng thái

❌ **DON'T:**
- Không spam notifications
- Không request permission ngay khi vào trang
- Không gửi notification vào ban đêm (nếu không cần thiết)

### 6.3: Error Handling

```typescript
const enableNotifications = async () => {
  try {
    const token = await requestNotificationPermission();
    
    if (!token) {
      // User denied permission
      showUserFriendlyMessage();
      return;
    }
    
    await registerDeviceToken(token);
  } catch (error) {
    if (error.code === 'messaging/permission-blocked') {
      // Permission permanently denied
      showInstructionsToUnblock();
    } else if (error.code === 'messaging/token-subscribe-failed') {
      // Network error
      showRetryOption();
    } else {
      // Other errors
      logToMonitoring(error);
    }
  }
};
```

---

## Phần 7: Troubleshooting

### Issue 1: "Firebase Messaging is not supported"

**Nguyên nhân:**
- Browser không hỗ trợ (IE, Opera Mini)
- Không có HTTPS (trên production)

**Giải pháp:**
- Kiểm tra browser compatibility
- Deploy lên HTTPS

### Issue 2: "Registration token not registered"

**Nguyên nhân:**
- Token đã expire
- User xóa cache
- App instance bị xóa

**Giải pháp:**
- Implement token refresh logic
- Handle error và re-request token

### Issue 3: Service Worker không load

**Nguyên nhân:**
- File không nằm ở `/public`
- Path sai trong registration
- CORS issues

**Giải pháp:**
- Đảm bảo file ở `public/firebase-messaging-sw.js`
- Check DevTools → Console → Errors

### Issue 4: Không nhận notification trên iOS Safari

**Nguyên nhân:**
- iOS Safari chưa fully support Web Push (trước iOS 16.4)
- Progressive Web App required

**Giải pháp:**
- Yêu cầu iOS >= 16.4
- Add to Home Screen (PWA)

---

## Phần 8: Advanced Features

### 8.1: Custom Notification UI

```typescript
// Trong onForegroundMessage callback
onForegroundMessage((payload) => {
  // Custom notification UI với Ant Design
  notification.open({
    message: payload.notification?.title,
    description: payload.notification?.body,
    icon: <BellOutlined style={{ color: '#108ee9' }} />,
    btn: (
      <Button type="primary" size="small" onClick={() => {
        window.location.href = payload.data?.actionUrl;
      }}>
        Xem ngay
      </Button>
    ),
    duration: 0, // Không tự đóng
  });
});
```

### 8.2: Notification Preferences

Cho phép user chọn loại notification muốn nhận:

```typescript
interface NotificationPreferences {
  orderUpdates: boolean;
  promotions: boolean;
  systemAlerts: boolean;
}

const savePreferences = async (prefs: NotificationPreferences) => {
  await axios.put('/api/v1/user/notification-preferences', prefs);
};
```

### 8.3: Analytics & Tracking

```typescript
// Track notification delivery
const trackNotificationReceived = (notificationId: string) => {
  analytics.track('notification_received', {
    notificationId,
    timestamp: Date.now(),
  });
};

// Track notification click
const trackNotificationClick = (notificationId: string) => {
  analytics.track('notification_clicked', {
    notificationId,
    timestamp: Date.now(),
  });
};
```

---

## Tóm tắt

### Checklist hoàn thành setup:

- [ ] Đăng ký Web App trên Firebase Console
- [ ] Tạo VAPID Key
- [ ] Cài đặt `firebase` package
- [ ] Tạo `src/config/firebase.ts`
- [ ] Tạo `public/firebase-messaging-sw.js`
- [ ] Tạo `.env` với Firebase credentials
- [ ] Tạo `src/services/notificationService.ts`
- [ ] Tạo `src/hooks/useNotification.ts`
- [ ] Integrate vào App component
- [ ] Thêm notification icons
- [ ] Test trên development
- [ ] Deploy to production (HTTPS)
- [ ] Test trên production

### Tài nguyên tham khảo:

- [Firebase Cloud Messaging Docs](https://firebase.google.com/docs/cloud-messaging/js/client)
- [Web Push Protocol](https://developers.google.com/web/fundamentals/push-notifications)
- [Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)

---

**Lưu ý cuối cùng:**

FCM Token được lấy thông qua `getToken(messaging, { vapidKey })` và được truyền đến backend qua API endpoint `/api/v1/notifications/device-token` kèm theo JWT authentication token trong header `Authorization: Bearer <token>`.
