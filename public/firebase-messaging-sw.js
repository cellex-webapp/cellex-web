// Firebase Cloud Messaging Service Worker
// File này xử lý push notifications khi app ở background

// Import Firebase scripts từ CDN
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.0/firebase-messaging-compat.js');

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
