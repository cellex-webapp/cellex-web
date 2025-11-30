import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage, type Messaging } from 'firebase/messaging';

// Firebase configuration
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
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
    console.log('🔍 Step 1: Checking messaging instance...');
    if (!messaging) {
      console.warn('❌ Firebase Messaging is not supported in this browser');
      return null;
    }
    console.log('✅ Messaging instance exists');

    console.log('🔍 Step 2: Checking Service Worker support...');
    if (!('serviceWorker' in navigator)) {
      console.warn('❌ Service Worker is not supported');
      return null;
    }
    console.log('✅ Service Worker is supported');

    console.log('🔍 Step 3: Waiting for Service Worker to be ready...');
    const swRegistration = await navigator.serviceWorker.ready;
    console.log('✅ Service Worker is ready:', swRegistration);

    console.log('🔍 Step 4: Requesting notification permission...');
    const permission = await Notification.requestPermission();
    console.log('📋 Permission result:', permission);
    
    if (permission === 'granted') {
      console.log('✅ Notification permission granted');
      
      console.log('🔍 Step 5: Getting FCM token...');
      console.log('📝 VAPID Key:', VAPID_KEY ? `${VAPID_KEY.substring(0, 20)}...` : 'NOT SET');
      
      const token = await getToken(messaging, { 
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swRegistration
      });
      
      if (token) {
        console.log('✅ FCM Token obtained:', token);
        return token;
      } else {
        console.warn('⚠️ No FCM token available (getToken returned empty)');
        return null;
      }
    } else if (permission === 'denied') {
      console.warn('❌ Notification permission denied by user');
      return null;
    } else {
      console.warn('⚠️ Notification permission dismissed');
      return null;
    }
  } catch (error) {
    console.error('❌ Error getting notification permission:', error);
    console.error('Error details:', {
      name: (error as Error).name,
      message: (error as Error).message,
      stack: (error as Error).stack
    });
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
