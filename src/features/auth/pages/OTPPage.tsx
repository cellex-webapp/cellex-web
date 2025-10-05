import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import OTPForm from '../components/OTPForm';
import { useAuth } from '@/hooks/useAuth';

const OTPPage: React.FC = () => {
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { login } = useAuth();

  useEffect(() => {
    const pending = localStorage.getItem('pendingSignup');
    if (!pending) {
      navigate('/signup');
    }
  }, [navigate]);

  const onSubmit = async (e?: React.FormEvent<HTMLFormElement>) => {
    if (e) e.preventDefault();
    setLoading(true);
    try {
      // TODO: verify OTP with backend
      await new Promise((res) => setTimeout(res, 800));
      const pending = localStorage.getItem('pendingSignup');
      if (pending) {
        const { email } = JSON.parse(pending) as { email: string };
        // Auto-login after verification (fake password, server would issue token)
        await login({ email, _password: 'verified-by-otp' });
        localStorage.removeItem('pendingSignup');
        navigate('/');
      } else {
        navigate('/login');
      }
    } catch (err) {
      console.error('OTP verify failed', err);
    } finally {
      setLoading(false);
    }
  };

  const onResend = async () => {
    try {
      // TODO: call resend API
      await new Promise((res) => setTimeout(res, 500));
      alert('Đã gửi lại mã OTP');
    } catch (err) {
      console.error('Resend OTP failed', err);
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
