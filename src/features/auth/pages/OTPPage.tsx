import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { unwrapResult } from '@reduxjs/toolkit';
import { useAuth } from '@/hooks/useAuth';
import OTPForm from '../components/OTPForm';

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const navigate = useNavigate();

  const { verifySignupCode, sendSignupCode, isLoading, error } = useAuth();

  useEffect(() => {
    const pending = localStorage.getItem('pendingSignup');
    if (!pending) {
      console.warn('Không tìm thấy thông tin đăng ký chờ, điều hướng về trang đăng ký.');
      navigate('/signup');
    }
  }, [navigate]);

  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
  if (e) e.preventDefault();
  
  const otpString = Array.isArray(otp) ? otp.join('') : otp;
  console.log("Giá trị OTP đang được kiểm tra:", otpString);
  console.log("Kiểu dữ liệu:", typeof otpString);
  console.log("Độ dài:", otpString.length);
  if (!/^\d{6}$/.test(otpString)) {
    alert('Vui lòng nhập đúng 6 chữ số OTP');
    return;
  }

  try {
    const pending = localStorage.getItem('pendingSignup');
    if (!pending) return navigate('/signup');
    
    const { email } = JSON.parse(pending) as { email: string };

    const actionResult = await verifySignupCode({ email, otp: otpString });
    unwrapResult(actionResult); 

    localStorage.removeItem('pendingSignup');
    alert('Xác thực tài khoản thành công! Vui lòng đăng nhập.');
    navigate('/login');

  } catch (rejectedValue) {
    console.error('OTP verify failed', rejectedValue);
  }
};

  const onResend = async () => {
    try {
      const pending = localStorage.getItem('pendingSignup');
      if (!pending) return navigate('/signup');
      
      const pendingData = JSON.parse(pending);

      await sendSignupCode(pendingData);
      alert('Đã gửi lại mã OTP thành công!');

    } catch (rejectedValue) {
      console.error('Resend OTP failed', rejectedValue);
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-3xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Xác thực OTP</h2>
          <p className="text-white/90 text-base md:text-lg">Nhập mã 6 số đã được gửi đến email của bạn.</p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12 bg-white">
          <OTPForm
            otp={otp}
            loading={isLoading}
            onChange={setOtp}
            onResend={onResend}
            onSubmit={onSubmit}
          />
          {error && <p className="text-red-500 text-sm mt-4 text-center">{error}</p>}
        </div>
      </div>
    </div>
  );
};

export default OTPPage;