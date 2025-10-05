import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPForm from '../components/OTPForm';
import { useDispatch } from 'react-redux';
import type { AppDispatch } from '@/stores/store';
import { verifySignupCodeThunk, sendSignupCodeThunk } from '@/stores/slices/authSlice';

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  // ensure any auth-related side effects are handled elsewhere; OTP page is stand-alone
  const dispatch = useDispatch<AppDispatch>();

  useEffect(() => {
    const pending = localStorage.getItem('pendingSignup');
    if (!pending) {
      navigate('/signup');
    }
  }, [navigate]);

  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    if (!/^\d{6}$/.test(otp)) {
      alert('Vui lòng nhập đúng 6 chữ số OTP');
      return;
    }
    setLoading(true);
    try {
      const pending = localStorage.getItem('pendingSignup');
      if (!pending) return navigate('/signup');
      const { email } = JSON.parse(pending) as { email: string };
      await dispatch(verifySignupCodeThunk({ email, otp })).unwrap();
      localStorage.removeItem('pendingSignup');
      navigate('/login');
    } catch (err: any) {
      console.error('OTP verify failed', err);
      alert(err?.message || 'Xác thực OTP thất bại');
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      const pending = localStorage.getItem('pendingSignup');
      if (!pending) return navigate('/signup');
      const { email, fullName, phoneNumber, password } = JSON.parse(pending) as any;
      await dispatch(
        sendSignupCodeThunk({ email, fullName, phoneNumber, password, confirmPassword: password })
      ).unwrap();
      alert('Đã gửi lại mã OTP');
    } catch (err) {
      console.error('Resend OTP failed', err);
      alert('Gửi lại OTP thất bại');
    }
  };

  return (
    <div className="min-h-screen pt-14 flex items-center justify-center relative bg-gradient-to-br from-sky-500 via-indigo-600 to-violet-600">
      <div className="w-full max-w-3xl rounded-2xl flex flex-col md:flex-row overflow-hidden relative z-10 shadow-2xl border border-white/20 bg-white/10 backdrop-blur-xl">
        <div className="md:w-1/2 flex flex-col justify-center items-start p-8 md:p-12 bg-white/5 text-white">
          <h2 className="text-3xl md:text-4xl font-extrabold mb-4">Xác thực OTP</h2>
          <p className="text-white/90 text-base md:text-lg">Nhập mã 6 số để xác thực tài khoản của bạn.</p>
        </div>
        <div className="md:w-1/2 w-full flex flex-col justify-center items-center p-8 md:p-12 bg-white">
          <OTPForm otp={otp} loading={loading} onChange={setOtp} onResend={onResend} onSubmit={onSubmit} />
        </div>
      </div>
    </div>
  );
};

export default OTPPage;
