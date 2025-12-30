import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import LoginForm from '../components/LoginForm';
import { unwrapResult } from '@reduxjs/toolkit';
import { message } from 'antd';
import { getErrorMessage } from '@/helpers/errorHandler';
import { requestNotificationPermission } from '@/config/firebase';
import notificationService from '@/services/notification.service';

/**
 * Get user agent info for device name
 */
const getUserAgentInfo = (): string => {
  const ua = navigator.userAgent;
  
  let browser = 'Unknown';
  if (ua.includes('Chrome')) browser = 'Chrome';
  else if (ua.includes('Firefox')) browser = 'Firefox';
  else if (ua.includes('Safari')) browser = 'Safari';
  else if (ua.includes('Edge')) browser = 'Edge';
  
  let os = 'Unknown';
  if (ua.includes('Windows')) os = 'Windows';
  else if (ua.includes('Mac')) os = 'MacOS';
  else if (ua.includes('Linux')) os = 'Linux';
  else if (ua.includes('Android')) os = 'Android';
  else if (ua.includes('iOS')) os = 'iOS';
  
  return `${browser} on ${os}`;
};

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const navigate = useNavigate();
  const { login, isLoading } = useAuth();

  const onLogin = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();

    try {
      const actionResult = await login({ email, password });
      const authResult = unwrapResult(actionResult);

      // Auto-request notification permission after successful login
      try {
        console.log('🔔 Starting notification setup...');
        const fcmToken = await requestNotificationPermission();
        
        if (fcmToken) {
          console.log('✅ FCM Token received:', fcmToken);
          
          // Save token to localStorage
          localStorage.setItem('fcmToken', fcmToken);
          
          // Prepare payload with explicit type
          const payload: DeviceTokenRequest = {
            fcmToken: fcmToken,
            deviceType: 'WEB',
            deviceName: getUserAgentInfo(),
          };
          console.log('📦 Payload to send:', payload);
          console.log('📦 Payload stringified:', JSON.stringify(payload));
          
          // Register token with backend
          console.log('📤 Sending token to backend...');
          const response = await notificationService.registerDeviceToken(payload);
          
          console.log('✅ Backend response:', response);
          console.log('✅ Push notification enabled automatically');
        } else {
          console.warn('⚠️ No FCM token received - user may have denied permission');
        }
      } catch (notifError) {
        // Don't block login if notification fails
        console.error('❌ Failed to enable notifications:', notifError);
      }

      const role = (authResult.user?.role || '').toLowerCase();
      if (role === 'admin') {
        navigate('/admin');
      } else if (role === 'vendor') {
        navigate('/vendor');
      } else {
        navigate('/');
      }
    } catch (rejectedValue) {
      const errMsg = getErrorMessage(rejectedValue) || 'Đăng nhập thất bại';
      message.error(errMsg);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-4xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-start md:justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Đăng nhập</h2>
          <p className="text-white/90 text-base md:text-lg">
            Vui lòng nhập đầy đủ thông tin số điện thoại và mật khẩu!
          </p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-start md:justify-center items-center p-8 md:p-12 bg-white mt-6 md:mt-0">
          <LoginForm
            email={email}
            password={password}
            loading={isLoading}
            onEmailChange={setEmail}
            onPasswordChange={setPassword}
            onSubmit={onLogin}
            onForgotPassword={() => navigate('/forgot-password')}
            onSignup={() => navigate('/signup')}
          />
        </div>
      </div>
    </div>
  );
};

export default LoginPage;