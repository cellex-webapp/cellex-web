// Firebase Cloud Messaging Service Worker
// File này xử lý push notifications khi app ở background

// Import Firebase scripts từ CDN
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

console.log('🔧 Firebase Messaging SW loaded');

// Firebase config (phải hardcode vì Service Worker không access được import.meta.env)
firebase.initializeApp({
  apiKey: "AIzaSyBbjFCQC8yoJjpvgjKT-MH4hqOfYR8mDqQ",
  authDomain: "cellex-bef38.firebaseapp.com",
  projectId: "cellex-bef38",
  storageBucket: "cellex-bef38.firebasestorage.app",
  messagingSenderId: "742937327544",
  appId: "1:742937327544:web:ad8571fd15cb6799c7814d",
  measurementId: "G-G9K412J1J0"
});

console.log('🔧 Firebase initialized in SW');

const messaging = firebase.messaging();

// Log khi service worker được cài đặt
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker installed');
  self.skipWaiting();
});

// Log khi service worker được kích hoạt
self.addEventListener('activate', (event) => {
  console.log('🔧 Service Worker activated');
  event.waitUntil(clients.claim());
});

// Handle push events directly (quan trọng - xử lý trước khi Firebase SDK can thiệp)
self.addEventListener('push', (event) => {
  console.log('📩 Push event received:', event);
  
  if (event.data) {
    try {
      const payload = event.data.json();
      console.log('📩 Push payload:', JSON.stringify(payload, null, 2));
      
      // Nếu có notification trong payload, FCM SDK sẽ tự hiển thị
      // Nếu chỉ có data payload, ta cần tự hiển thị
      if (!payload.notification && payload.data) {
        const title = payload.data.title || 'Thông báo mới';
        const options = {
          body: payload.data.body || payload.data.message || '',
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          data: payload.data,
          requireInteraction: true,
          tag: payload.data.type || 'default',
          vibrate: [200, 100, 200],
        };
        
        event.waitUntil(
          self.registration.showNotification(title, options)
        );
      }
    } catch (e) {
      console.error('❌ Error parsing push data:', e);
    }
  }
});

// Handle background messages (khi app không mở hoặc minimize)
// LƯU Ý: Callback này CHỈ được gọi khi message chỉ có data payload (không có notification)
messaging.onBackgroundMessage((payload) => {
  console.log('📩 onBackgroundMessage received:', payload);

  // Nếu có notification payload, FCM SDK đã tự hiển thị rồi
  // Chỉ cần xử lý khi KHÔNG có notification payload
  if (payload.notification) {
    console.log('📩 Notification payload exists, FCM SDK will handle display');
    return;
  }

  const notificationTitle = payload.data?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.data?.body || payload.data?.message || '',
    icon: '/icon-192x192.png',
    badge: '/badge-72x72.png',
    image: payload.data?.image,
    data: payload.data,
    requireInteraction: true,
    tag: payload.data?.type || 'default',
    vibrate: [200, 100, 200],
  };

  console.log('📩 Showing notification:', notificationTitle, notificationOptions);
  
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
